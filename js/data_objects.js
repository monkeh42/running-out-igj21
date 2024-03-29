const START_PLAYER = {
    augs: new Decimal(0),
    money: new Decimal(300),
    startMoney: new Decimal(300),
    lastAugsAtReset: new Decimal(1),
    brPoints: new Decimal(0),
    totalBRPoints: new Decimal(0),
    spentBRPoints: new Decimal(0),

    lastUpdate: new Date().getTime(),
    lastAutoSave: new Date().getTime(),
    devSpeed: 1,

    prodUpgs: [],
    prodBuyables: [0, 0],
    brUpgs: [],

    activeTab: 'prod',
    seenIntro: false,
}

var OPTIONS_DATA = {
    1: {
        title: 'HARD RESET',
        altTitle: '',
        altToggle: function() { return false; },
        fxn: function() { hardResetClick() },
    },
    2: {
        title: 'IMPORT SAVE',
        altTitle: '',
        altToggle: function() { return false; },
        fxn: function() { importToggle() },
    },
    3: {
        title: 'EXPORT SAVE',
        altTitle: '',
        altToggle: function() { return false; },
        fxn: function() { exportSave() },
    },
}

var DEFAULT_DATA = {
    layerDisplay: {
        numClass: 'defNum',
    }
};