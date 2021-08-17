var MONEY_DATA = {
    layerDisplay: {
        numClass: 'moneyNum',
    }
};

var BANKRUPT_DATA = {
    layerDisplay: {
        numClass: 'brNum',
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
    player.brPoints = player.brPoints.plus(brp);
    player.totalBRPoints = player.totalBRPoints.plus(brp);
    player.augs = START_PLAYER.augs;
    player.startMoney = start;
    player.money = start;
    player.prodUpgs = new Array();
}

function calculateProfit() {
    return player.spentBRPoints;
}

function calculateSpending() {
    return new Decimal(0);
}

function calculateCreditsPerSec() {
    let c = calculateProfit().minus(calculateSpending());
    return c;
}