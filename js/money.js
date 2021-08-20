var MONEY_DATA = {
    layerDisplay: {
        numClass: 'moneyNum',
    }
};

var BANKRUPT_DATA = {
    layerDisplay: {
        numClass: 'brNum',
    },
    upgrades: {
        className: 'br-upg',
        isBought: (id) => player.brUpgs.includes(id),
        canAfford: (id) => player.brPoints.gte(DATA.b.upgrades[id].cost()),
        buyUpg: function(id) {
            if (DATA.b.upgrades.isBought(id) || !DATA.b.upgrades.canAfford(id)) { return; }
            player.brPoints = player.brPoints.minus(DATA.b.upgrades[id].cost());
            player.spentBRPoints = player.spentBRPoints.plus(DATA.b.upgrades[id].cost());
            player.brUpgs.push(parseInt(id));
        },
        1: {
            title: 'Workforce',
            desc: () => 'Unlock the ability to hire employees.',
            cost: () => new Decimal(1),
            displayEffect: false,
            effect: function() {
                return new Decimal(1);
            }
        },
        2: {
            title: 'First Enhancer',
            desc: () => 'Boosts all production based on augments.',
            cost: () => new Decimal(20),
            requires: new Decimal(10),
            displayEffect: true,
            effectString: () => (format(DATA.p.upgrades[2].effect(), 2) + 'x'),
            effect: function() {
                let e = new Decimal(1);
                if (player.augs.gte(1)) { e = e.plus(player.augs.log10()); }
                return e;
            }
        },
        3: {
            title: 'Second Producer',
            desc: () => 'Produces 5 augments per second.',
            cost: () => new Decimal(75),
            requires: new Decimal(25),
            displayEffect: false,
            effect: function() {
                let e = new Decimal(5);
                if (hasProdUpg(4)) { e = e.times(2); }
                return e;
            }
        },
        4: {
            title: 'Second Enhancer',
            desc: () => 'Doubles base production of all producers.',
            cost: () => new Decimal(200),
            requires: new Decimal(100),
            displayEffect: false,
        },
    }
}

function isBankrupt() {
    return player.money.eq(0);
}

function calculateBRGain() {
    if (player.money.gt(0)) { return new Decimal(0); }
    let div = 3;
    let ret = Decimal.floor(Decimal.pow(10, (player.augs.e/div) - 0.65));
    return ret;
}

function calculateStartMoney() {
    let m = player.augs.div(player.lastAugsAtReset).log10();
    return player.startMoney.times(Math.max(m, 1));
}

function calculateStartMoneyMult() {
    let m = player.augs.div(player.lastAugsAtReset).log10();
    return Math.max(m, 1);
}

function goBankrupt() {
    if (!isBankrupt()) { return; }
    let start = calculateStartMoney();
    let brp = calculateBRGain();
    player.lastAugsAtReset = player.augs;
    player.brPoints = player.brPoints.plus(brp);
    player.totalBRPoints = player.totalBRPoints.plus(brp);
    player.augs = START_PLAYER.augs;
    player.startMoney = start;
    player.money = start;
    player.prodUpgs = new Array();
    player.buyableUpgs = [...START_PLAYER.prodBuyables]
}

function getBRPointEffect() {
    let e = new Decimal(1);
    e = e.plus(player.totalBRPoints.plus(1).log10());
    return Decimal.max(e, 1);
}

function calculateProfit() {
    return player.spentBRPoints;
}

function calculateSpending() {
    return DATA.p.buyables[1].effect();
}

function calculateCreditsPerSec() {
    let c = calculateProfit().minus(calculateSpending());
    return c;
}