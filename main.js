//consts and such

const GAME_DATA = {
    author: 'monkeh42',
    version: 'v0.0.1',
}

var mainLoop;

var popupShownTime;

var mPopupShownTime;

var sPopupShownTime;

var asPopupShownTime;

var hidden, visibilityChange, isHidden;

var player = {};

var dataKeys = {};

var DATA = {};

var activePopups = [];

const HOTKEY_KEYS = { 'm': 1, 'a': 2, 'p': 3, 's': 4, 't': 5, 'n': 6, 'g': 7, 'q': 8, 'w': 9, 'e': 10, 'r': 11, 'f': 12 };

//initialize

function init() {
    loadGame();

    startGame();
}

//load stuff

function loadGame() {
    setupData();
    player = {};
    player.res = new Decimal(10);
    player.money = new Decimal(20);
    /*var savePlayer = localStorage.getItem('nekrosave');
    if (savePlayer === null || savePlayer === undefined) {
        copyData(player, START_PLAYER);
    } else {
        copyData(player, JSON.parse(window.atob(savePlayer)));
        if (Object.keys(player).length == 0) { copyData(player, START_PLAYER); }
    }
    fixData(player, START_PLAYER); */
    //if (player.version != GAME_DATA.version) { updateVersion(); }

    loadVue();
}

function addData(id, name, data) {
    DATA[id] = {};
    copyData(DATA[id], data);
    dataKeys[id] = name;
}

function setupData() {
    addData('p', 'production', PROD_DATA);
    addData('m', 'money', MONEY_DATA);
    /*addData('hk', 'hotkeys', HOTKEYS);
    addData('sk', 'stat keys', STAT_KEYS);
    addData('header', 'header displays', HEADER_DATA);
    addData('tabs', 'tabs and subtabs', TABS_DATA);
    addData('o', 'options', OPTIONS_DATA);
    addData('sp', 'start player', START_PLAYER);
    addData('ul', 'unlocks', UNLOCKS_DATA);
    addData('ach', 'achievements', ACH_DATA);
    addData('ms', 'milestones', MILES_DATA);
    addData('ab', 'autobuyers', AUTOBUYERS_DATA);
    addData('u', 'units', UNITS_DATA);
    addData('b', 'buildings', BUILDS_DATA[0]);
    for (let i=1; i<=4; i++) { addData('b'+i.toString(), BUILDS_DATA[i].id, BUILDS_DATA[i]); }
    addData('c', 'construction', CONSTR_DATA);
    addData('t', 'time', TIME_DATA);
    //addData('tu', 'time upgrades', TIME_UPGRADES);
    //addData('td', 'time dimensions', TIME_DIMENSIONS);
    addData('g', 'galaxies', GALAXIES_DATA[0]);
    for (let j=1; j<=4; j++) { addData('g'+j.toString(), GALAXIES_DATA[j].name, GALAXIES_DATA[j]); }
    addData('a', 'ark', ARK_DATA);
    addData('r', 'research', RESEARCH_DATA);
    addData('e', 'ethereal', ETH_DATA);*/
}

//main loop and related

function startGame() {
    var diff = new Date() - player.lastUpdate;

    player.lastUpdate = new Date();
    //player.lastAutoSave = new Date();
    player.lastWindowUpdate = new Date();
    //save();

    startInterval();
}

function startInterval() {
    mainLoop = setInterval(gameLoop, 50);
}

function gameLoop(diff=new Decimal(0)) {
    var currentUpdate = new Date().getTime();
    diff = new Decimal(currentUpdate - player.lastUpdate); 
    if (app.devSpeed>0) { diff = diff.times(app.devSpeed); }

    //updateUnlocks();
    
    //updateAchievements();

    /*if ((currentUpdate-player.lastAutoSave)>10000) { 
        player.lastAutoSave = currentUpdate;
        save();
        if (player.headerDisplay['autosavePopup']) {
            if (!player.win || player.continue) { showPopup('autosavePopup', 'Game Autosaved!', 2000); }
        }
    }*/
    player.lastUpdate = currentUpdate;

    //popupTimers(diff);
    
}

function popupTimers(dif) {
    for (popup in app.$refs['popupscontainer'].timedPopups) {
        app.$refs['popupscontainer'].timedPopups[popup]['time'] -= dif;
        if (app.$refs['popupscontainer'].timedPopups[popup]['time'] <= 0) {
            app.$refs['popupscontainer'].timedPopups.splice(popup, 1);
        }
    }
}

//fixes and data manipulation

function copyData(data, start) {
    for (item in start) {
        if (start[item] == null) {
            if (data[item] === undefined) {
                data[item] = null;
            }
        } else if (Array.isArray(start[item])) {
            data[item] = [];
            copyData(data[item], start[item]);
        } else if (start[item] instanceof Decimal) {
            data[item] = new Decimal(start[item]);
        } else if (start[item] instanceof Date) {
            data[item] = new Date(start[item]);
        } else if ((!!start[item]) && (typeof start[item] === "object")) {
            data[item] = {};
            copyData(data[item], start[item]);
        } else {
            data[item] = start[item];
        }
    }

}

function fixData(data, start) {
    for (item in start) {
        if (start[item] == null) {
            if (data[item] === undefined) {
                data[item] = null;
            }
        } else if (Array.isArray(start[item])) {
            if (data[item] === undefined) {
                data[item] = [];
            }
            fixData(data[item], start[item]);
        } else if (start[item] instanceof Decimal) {
            if (data[item] === undefined) {
                data[item] = new Decimal(start[item]);
            } else {
                data[item] = new Decimal(data[item]);
            }
        } else if (start[item] instanceof Date) {
            if (data[item] === undefined) {
                data[item] = new Date(start[item]);
            } else { data[item] = new Date(data[item]); }
        } else if ((!!start[item]) && (typeof start[item] === "object")) {
            if (data[item] === undefined) {
                data[item] = {};
            }
            fixData(data[item], start[item]);
        } else {
            if (data[item] === undefined) {
                data[item] = start[item];
            }
        }
    }
}