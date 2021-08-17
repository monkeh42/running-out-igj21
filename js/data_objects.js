const START_PLAYER = {
    mach: new Decimal(0),
    money: new Decimal(300),
    startMoney: new Decimal(300),
    lastMachAtReset: new Decimal(1),
    brPoints: new Decimal(0),
    totalBRPoints: new Decimal(0),

    lastUpdate: new Date().getTime(),
    devSpeed: 1,

    prodUpgs: [],

    activeTab: 'prod',
}