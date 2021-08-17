var PROD_DATA = {
    layerDisplay: {
        numClass: 'prodNum',
    },
    upgrades: {
        className: 'prod-upg',
        isBought: (id) => player.prodUpgs.includes(id),
        canAfford: (id) => player.money.gte(DATA.p.upgrades[id].cost())&&player.augs.gte(DATA.p.upgrades[id].requires),
        buyUpg: function(id) {
            if (DATA.p.upgrades.isBought(id) || !DATA.p.upgrades.canAfford(id)) { return; }
            player.money = player.money.minus(DATA.p.upgrades[id].cost());
            player.prodUpgs.push(parseInt(id));
        },
        1: {
            title: 'First Producer',
            desc: () => 'Produces 1 augments per second.',
            cost: () => new Decimal(5),
            displayEffect: false,
            effect: function() {
                let e = new Decimal(1);
                if (hasProdUpg(4)) { e = e.times(2); }
                return e;
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
};

function calculateProduction() {
    let prod = new Decimal(0);
    if (hasProdUpg(1)) { prod = prod.plus(getProdUpgEffect(1)); }
    if (hasProdUpg(3)) { prod = prod.plus(getProdUpgEffect(3)); }
    if (hasProdUpg(2)) { prod = prod.times(getProdUpgEffect(2)); }
    return prod;
}

function hasProdUpg(id) {
    return DATA.p.upgrades.isBought(id);
}

function getProdUpgEffect(id) {
    return DATA.p.upgrades[id].effect();
}