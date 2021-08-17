const START_PLAYER = {
    augs: new Decimal(0),
    money: new Decimal(300),
    startMoney: new Decimal(300),
    lastAugsAtReset: new Decimal(1),
    brPoints: new Decimal(0),
    totalBRPoints: new Decimal(0),
    spentBRPoints: new Decimal(0),

    lastUpdate: new Date().getTime(),
    devSpeed: 1,

    prodUpgs: [],

    activeTab: 'prod',
    seenIntro: false,
}