var PROD_DATA = {
    layerDisplay: {
        numClass: 'prodNum',
    },
    upgrades: {
        className: 'prod-upg',
        isBought: (id) => false,
        canAfford: (id) => player.money.gte(this[id].cost()),
        1: {
            title: 'First Producer',
            desc: () => 'Produces 1 resource per second.',
            cost: () => new Decimal(5),
            displayEffect: false,
        },
    }
};