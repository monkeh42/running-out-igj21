var app;

function loadVue() {

	Vue.component('tab-button', {
		props: ['data', 'active'],
		methods: {
			isNotify(tab) { return player.tabNotify[tab].notify },
			isIndirect(tab) { return player.tabNotify[tab].indirect },
		},
		template: `
		<div v-if="DATA.tabs[data].unlocked()">
			<button v-bind:class="{ tabBut: true, tabButSelected: (active==DATA.tabs[data].pid && data!='h'), helpButSelected: (data=='h' && player.help), tabButNotify: isNotify(data), tabButIndirectNotify: isIndirect(data), timeUnlockedNotify: (data=='t'&&(((player.totalEmitters-player.antiEmitters-player.trueEmitters)>0)||!player.timeLocked)) }" v-on:click="tabButtonClick(data)" v-html="((data=='h' && player.help) ? 'CLOSE HELP' : DATA.tabs[data].title)"></button>
		</div>
		`
	}) 

	Vue.component('sub-tab-button', {
		props: ['data', 'id', 'active'],
		methods: {
			isNotify(tab, sub) {
				return player.tabNotify[tab][sub.slice(0,1)].notify; 
			},
		},
		template: `
		<div v-if="DATA.tabs[data].subTabs[id].unlocked()">
			<button v-bind:class="{ subTabBut: true, tabButSelected: (active==DATA.tabs[data].subTabs[id].pid), tabButNotify: isNotify(data, id), timeUnlockedNotify: (id=='refinery'&&(((player.totalEmitters-player.antiEmitters-player.trueEmitters)>0)||!player.timeLocked)) }" v-bind:style="[(isResearchCompleted(6)&&(id=='research')) ? { 'text-decoration': 'line-through' } : {}]" v-on:click="subTabButtonClick(data, id)" v-html="DATA.tabs[data].subTabs[id].title"></button>
		</div>
		`
	}) 

	Vue.component('sub-nav', {
		props: ['data', 'ids', 'active'],
		template: `
		<div v-if="DATA.tabs[data].subUnlocked()" class="subNavMenu">
			<div v-for="i in ids.length">
				<sub-tab-button :data="data" :id="ids[i-1]" :active="active"></sub-tab-button>
			</div>
		</div>
		`
	})

	Vue.component('main-nav', {
		props: ['data', 'active'],
		template: `
		<div class="navMenu">
			<div v-for="i in data.length">
				<tab-button :data="data[i-1]" :active="active"></tab-button>
			</div>
		</div>
		`
	})

	Vue.component('num-text', {
		props: ['data', 'val', 'label'],
		methods: {
			plural(d, str) {
				if (d=='infinity') { return str }
				d = new Decimal(d.replace(',', ''));
				if (str.slice(-3)=='ies') { return (d.eq(1) ? (str.slice(0, -3)+'y') : str); }
				else { return (d.eq(1) ? str.slice(0, -1) : str); }
			},
		},
		template: `
		<span><span :class="DATA[data].layerDisplay.numClass" v-html="(label=='$' ? '$' : '') + val"></span>{{ (label=='$' ? '' : ' '+plural(val, label)) }}</span>
		`
	})

	Vue.component('num-text-plain', {
		props: ['val', 'label'],
		methods: {
			plural(d, str) {
				if (d=='infinity') { return str }
				d = new Decimal(d.replace(',', ''));
				if (str.slice(-3)=='ies') { return (d.eq(1) ? (str.slice(0, -3)+'y') : str); }
				else if (str=='research'||str=='void research'||str=='') { return str; }
				else { return (d.eq(1) ? str.slice(0, -1) : str); }
			},
		},
		template: `
		<span v-html="val + ' ' + plural(val, label)"></span>
		`
	})

	Vue.component('multi-boxes', {
		props: ['data'],
		template: `
		<div v-bind:class="{ [DATA[data].multi.idPre + 'Table']: true }">
			<div v-for="row in DATA[data].multi.rows" v-bind:class="{ [DATA[data].multi.idPre + 'Row']: true }">
				<div v-for="col in DATA[data].multi.cols"><div v-if="DATA[data].multi.boxUnlocked(row*10+col)" v-bind:class="{ [DATA[data].multi.idPre + 'Cell']: true }">
					<multi-box :data="data" :id="row*10+col"></multi-box>
				</div></div>
			</div>
		</div>
		`
	})

	Vue.component('multi-box', {
		props: ['data', 'id'],
		template: `
		<div v-bind:class="{ [DATA[data].multi.klass()]: true }">
			<div v-for="i in DATA[data].multi.numElsByBox(id)">
				<component v-if="(DATA[data].multi.dataLists[id][i].tag=='auto-emitter-button')&&DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag" :data="12"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='sacrifice-buyer-options')&&DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='buyer-amount')&&DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag" :id="id"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='unit-buyer-button')&&DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag" :data="DATA[data].multi.dataLists[id][i].boxID" :method="(DATA[data].multi.dataLists[id][i].htm())"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='unit-buyer-priority')&&DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag" :id="DATA[data].multi.dataLists[id][i].boxID"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='button')&&data!='e'" :is="DATA[data].multi.dataLists[id][i].tag" v-bind:class="{ completedResearchBut: isResearchCompleted(DATA[data].multi.dataLists[id][i].boxID), researchButton: (canCompleteResearch(DATA[data].multi.dataLists[id][i].boxID)||!player.isInResearch), progressResearchButton: (isResearchActive(DATA[data].multi.dataLists[id][i].boxID)&&!canCompleteResearch(DATA[data].multi.dataLists[id][i].boxID)), unclickResearchBut: (player.isInResearch&&!isResearchActive(DATA[data].multi.dataLists[id][i].boxID)&&!isResearchCompleted(DATA[data].multi.dataLists[id][i].boxID)) }"
							v-bind:style="((player.isInResearch&&!isResearchCompleted(DATA[data].multi.dataLists[id][i].boxID)&&!isResearchActive(DATA[data].multi.dataLists[id][i].boxID)) ? {'text-decoration': 'line-through'} : {})" v-on:click="researchButtonClick(DATA[data].multi.dataLists[id][i].boxID)"
							v-html="(isResearchCompleted(DATA[data].multi.dataLists[id][i].boxID) ? 'COMPLETED' : (player.isInResearch ? (isResearchActive(DATA[data].multi.dataLists[id][i].boxID) ? (canCompleteResearch(DATA[data].multi.dataLists[id][i].boxID) ? 'COMPLETE<br>PROJECT' : 'IN PROGRESS') : 'BEGIN') : 'BEGIN'))"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='button')&&data=='e'" :is="DATA[data].multi.dataLists[id][i].tag" v-bind:class="{ completedInfResearchBut: isResearchCompleted(DATA[data].multi.dataLists[id][i].boxID), infResearchButton: (canCompleteResearch(7)||!player.isInResearch), progressInfResearchButton: (isResearchActive(7)&&!canCompleteResearch(7)), unclickInfResearchBut: (player.isInResearch&&!isResearchActive(7)) }"
							v-bind:style="((player.isInResearch&&!isResearchActive(7)) ? {'text-decoration': 'line-through'} : {})" v-on:click="researchButtonClick(7)"
							v-html="(player.isInResearch ? (isResearchActive(7) ? (canCompleteResearch(7) ? 'COMPLETE<br>PROJECT' : 'IN PROGRESS') : 'BEGIN') : 'BEGIN')"></component>
				<component v-else-if="(DATA[data].multi.dataLists[id][i].tag=='buyer-amount-emitters')" :is="DATA[data].multi.dataLists[id][i].tag"></component>
				<component v-else-if="DATA[data].multi.showEl(id, i)" :is="DATA[data].multi.dataLists[id][i].tag" v-bind:class="{ [DATA[data].multi.dataLists[id][i].klass()]: true }" 
							v-bind:style="(DATA[data].multi.dataLists[id][i].style !== undefined) ? DATA[data].multi.dataLists[id][i].style() : {}" 
							v-html="DATA[data].multi.dataLists[id][i].htm()" 
							v-on:click="function() { if(DATA[data].multi.dataLists[id][i].click!==undefined) { DATA[data].multi.dataLists[id][i].click() } }"></component>
			</div>
		</div>
		`
	})

	Vue.component('upgrade', {
		props: {
			data: String, 
			id: String,
		},
		template: `
		<div>
			<div v-if="DATA[data].upgrades[id]!== undefined" v-on:click="DATA[data].buyUpg(data, id)" v-bind:class="{ [DATA[data].upgrades.className]: true, bought: DATA[data].upgrades.isBought(id), cant: ((!DATA[data].upgrades.canAfford(id))&&(!DATA[data].upgrades.isBought(id))), can: (DATA[data].upgrades.canAfford(id)&&(!DATA[data].upgrades.isBought(id)))}">
				<span v-html="DATA[data].upgrades[id].title" style="font-weight: bold;"></span><br>
				<span v-html="DATA[data].upgrades[id].desc()+'<br>'"></span>
				<span v-if="DATA[data].upgrades[id].requires!==undefined">Requires: <num-text :data="data" :val="formatWhole(DATA[data].upgrades[id].requires)" label="resources"></num-text></span><br>
				Cost: <num-text :val="formatDefault(DATA[data].upgrades[id].cost())" label="$"></num-text-plain>
				<span v-if="DATA[data].upgrades[id].displayEffect"><br>Currently: <span v-html="DATA[data].upgrades[id].effectString()"></span></span>
			</div>
		</div>
		`
	})

	Vue.component('prestige-button', {
		props: ['data'],
		template: `
		<div class="prestigeContainer">
			<button v-on:click="DATA[data].prestige.doReset()" v-bind:class="{ [DATA[data].prestige.className]: true, cant: !DATA[data].prestige.canReset(), can: DATA[data].prestige.canReset(), tooltip: (player.tooltipsEnabled&&DATA[data].prestige.displayTooltip)}" v-bind:data-title="DATA[data].prestige.displayFormula()">
				<div v-html="DATA[data].prestige.heading" style="font-weight: 900; font-size: 17pt; margin: 5px 0px;"></div>
				<div v-if="DATA[data].prestige.displayDesc()" style="margin: 5px 0px;" v-html="DATA[data].prestige.desc()"></div>
				<div v-if="DATA[data].prestige.canReset()" style="font-size: 15pt; margin: 0px;">Reset for <num-text-plain :val="formatPrestige(DATA[data].prestige.getGain())" :label="DATA[data].prestige.gainResource"></num-text-plain></div>
				<div v-if="!DATA[data].prestige.canReset()" style="font-size: 15pt; margin: 0px;">Requires {{ DATA[data].prestige.getReqAmount() }} {{ DATA[data].prestige.getReqResource() }}</div>
				<div v-if="DATA[data].prestige.canReset()&&DATA[data].prestige.showNextAt" style="font-size: 15pt; margin: 0px;">Next at {{ formatWhole(DATA[data].prestige.getNextAt()) }} {{ DATA[data].prestige.getReqResource() }}</div>
			</button>
		</div>
		`
	})

	Vue.component('opt-button', {
		props: ['data'],
		template: `
		<div>
			<button v-bind:class="{ optBut: true }" v-on:click="DATA.o[data].fxn()" v-html="(DATA.o[data].altToggle() ? DATA.o[data].altTitle : DATA.o[data].title)"></button>
		</div>
		`
	}) 

	Vue.component('options-table', {
		props: [],
		template: `
		<div class="optionsTable">
			<div v-for="row in DATA['o'].rows" class="optRow">
				<div v-for="col in DATA['o'].cols"><div class="optButCell">
					<opt-button :data="10*row+col"></opt-button>
				</div></div>
			</div>
		</div>
		`
	}) 

	Vue.component('milestone', {
		props: ['data'],
		template: `
		<div v-bind:class="{ milestoneTD: true, locked: !player.milestones[data], unlocked: player.milestones[data] }">
			<span v-bind:class="{ milestoneReq: true, unlocked: player.milestones[data] }" v-html="DATA.ms[data].reqText"></span><br>
			<span class="milestoneReward" style="font-size: 11pt;" v-html="DATA.ms[data].rewardText"></span>
		</div>
		`
	})

	Vue.component('milestones', {
		props: [],
		template: `
		<div class="milestoneTable">
			<div v-for="i in 7">
				<milestone :data="i"></milestone>
			</div>
		</div>
		`
	})

	Vue.component('toggle-button', {
		props: {'fname': String,
				'args': {
					type: null,
					default: null,
				}, 
				'on': Boolean,
		},
		methods: {
			call(f, a) {
				if (a === null) { window[f](); }
				else if (Array.isArray(a)) { window[f](a[0], a[1]); }
				else { window[f](a); }
			}
		},
		template: `
		<button class="confBut" v-on:click="call(fname, args)" v-html="on ? 'ON' : 'OFF'"></button>
		`
	})

	Vue.component('display-toggle', {
		props: ['data'],
		template: `
		<div class="toggleRow">
			<div class="toggleText" v-html="DATA.header[data].text"></div>
			<div class="toggleButtonDiv">
				<toggle-button class="confBut" fname="toggleDisplay" :args="DATA.header[data].id" :on="player.headerDisplay[DATA.header[data].id]"></toggle-button>
			</div>
		</div>
		`
	})

	Vue.component('display-toggles', {
		props: [],
		template: `
		<div class="displayButtonsTable">
			<div v-for="i in DATA.header.rows">
				<div v-if="player.headerDisplayUnlocked[DATA.header[i].id]">
					<display-toggle :data="i"></display-toggle>
				</div>
			</div>
			<button class="displayButSkinny" style="margin: 10px;" v-on:click="setDisplayDefaults()">defaults</button>
		</div>
		`
	})

	Vue.component('confirm-toggle', {
		props: ['data'],
		template: `
		<div class="toggleRow">
			<div class="toggleText" v-html="DATA.ul.confirmations[data].text"></div>
			<div class="toggleButtonConfDiv">
				<toggle-button class="confBut" :data="DATA.ul.confirmations[data].id" fname="toggleConfirmations" :args="[DATA.ul.confirmations[data].id, 'click']" :on="player.confirmations[DATA.ul.confirmations[data].id]['click']"></toggle-button>
			</div>
			<div class="toggleButtonConfDiv">
				<toggle-button class="confBut" :data="DATA.ul.confirmations[data].id" fname="toggleConfirmations" :args="[DATA.ul.confirmations[data].id, 'key']" :on="player.confirmations[DATA.ul.confirmations[data].id]['key']"></toggle-button>
			</div>
		</div>
		`
	})

	Vue.component('confirm-toggles', {
		props: [],
		template: `
		<div class="confirmButtonsTable">
			<div class="toggleRow">
				<div class="toggleText"><strong>action</strong></div>
				<div class="toggleButtonConfHead">
					<strong>on<br>click</strong>
				</div>
				<div class="toggleButtonConfHead">
					<strong>on<br>key</strong>
				</div>
			</div>
			<div v-for="i in DATA.ul.confirmations.rows">
				<div v-if="player.confirmations[DATA.ul.confirmations[i].id].unlocked">
					<confirm-toggle :data="i"></confirm-toggle>
				</div>
			</div>
			<button class="displayButSkinny" style="margin: 10px;" v-on:click="setConfDefaults()">defaults</button>
		</div>
		`
	})

	Vue.component('stats-table', {
		props: ['data'],
		template: `
		<div>
			<div class="statsTableDiv">
				<h3>{{ player.stats[data].label }}</h3>
				<div class="statsHeader">
					<div class="resourceCellH">resource</div>
					<div class="totalCellH">total</div>
					<div class="bestCellH">best</div>
				</div>
				<div class="statsRow">
					<div class="resourceCell">corpses</div>
					<div class="totalCell">{{ formatWhole(player.stats[data].totalCorpses) }}</div>
					<div class="bestCell">{{ formatWhole(player.stats[data].bestCorpses) }}</div>
				</div>
				<div class="statsRow">
					<div class="resourceCell">astral bricks</div>
					<div class="totalCell">{{ formatWhole(player.stats[data].totalBricks) }}</div>
					<div class="bestCell">{{ formatWhole(player.stats[data].bestBricks) }}</div>
				</div>
				<div class="statsRow" v-if="(data=='thisAscStats')||((data=='allTimeStats')&&player.stats['allTimeStats'].totalTimeResets.gt(0))">
					<div class="resourceCell">time crystals</div>
					<div class="totalCell">{{ formatWhole(player.stats[data].totalCrystals) }}</div>
					<div class="bestCell">{{ formatWhole(player.stats[data].bestCrystals) }}</div>
				</div>
				<div class="statsRow">
					<div class="resourceCell">exterminated worlds</div>
					<div class="totalCell">{{ formatWhole(player.stats[data].totalWorlds) }}</div>
					<div class="bestCell">{{ formatWhole(player.stats[data].bestWorlds) }}</div>
				</div>
				<div class="statsRow" v-if="(data=='allTimeStats')&&player.stats['allTimeStats'].totalAscensions.gt(0)">
					<div class="resourceCell">depleted galaxies</div>
					<div class="totalCell">{{ formatWhole(player.stats[data].totalGalaxies) }}</div>
					<div class="bestCell">{{ formatWhole(player.stats[data].bestGalaxies) }}</div>
				</div>
			</div>
			<div class="statsTableText">
				<div>
					<span>you have world prestiged {{ formatWhole(player.stats[data].totalSpaceResets) }} times</span>
					<span v-if="(data=='thisAscStats')||((data=='allTimeStats')&&player.stats['allTimeStats'].totalTimeResets.gt(0))"> / sacrificed {{ formatWhole(player.stats[data].totalSpaceResets) }} times</span>
					<span v-if="data=='allTimeStats'"> / ascended {{ formatWhole(player.stats[data].totalAscensions) }} times</span>
				</div>
				<div>
					<span v-if="(data=='thisAscStats')||((data=='allTimeStats')&&player.stats['allTimeStats'].totalTimeResets.gt(0))">your best crystal gain was {{ formatWhole(player.stats[data].bestCrystalGain) }} and your best crystal gain rate was {{ formatWhole(player.stats[data].bestCrystalRate) }}/min</span>
				</div>
				<div>
					<span v-if="(data=='allTimeStats')&&player.stats['allTimeStats'].totalAscensions.gt(0)">you have spent a total of {{ formatWhole(player.stats[data].totalSpentGalaxies) }} galaxies</span>
				</div>
			</div>
		</div>
		`
	})

	Vue.component('stats-page', {
		props: [],
		template: `
		<div class="statsTables">
			<div v-if="player.stats['thisSacStats'].displayStats()">
				<stats-table data="thisSacStats"></stats-table>
			</div>
			<div v-if="player.stats['thisAscStats'].displayStats()">
				<stats-table data="thisAscStats"></stats-table>
			</div>
			<div>
				<stats-table data="allTimeStats"></stats-table>
			</div>
		</div>
		`
	})

	Vue.component('ten-sac', {
		props: [],
		template: `
		<div class="pastRunsTable">
			<div v-if="(player.pastRuns.lastRun.timeSpent != 0)">
				<div><h3>Last 10 Sacrifice Runs</h3></div>
				<div v-html="'Avg. of past 10 runs: ' + generateSacAvgs()"></div>
				<br>
				<div v-for="i in 10">
					<div v-html="generateSacString(i-1)"></div>
				</div>
			</div>
			<div v-else>
				<div><h3>Last 10 Sacrifice Runs</h3></div>
				<div>you don't have any past runs!</div>
			</div>
		</div>
		`
	})

	Vue.component('ten-asc', {
		props: [],
		template: `
		<div class="pastRunsTable">
			<div v-if="(player.pastAscRuns.lastRun.timeSpent != 0)">
				<div><h3>Last 10 Ascension Runs</h3></div>
				<div v-html="'Avg. of past 10 runs: ' + generateAscAvgs()"></div>
				<br>
				<div v-for="i in 10">
					<div v-html="generateAscString(i-1)"></div>
				</div>
			</div>
			<div v-else>
				<div><h3>Last 10 Ascension Runs</h3></div>
				<div>you don't have any past runs!</div>
			</div>
		</div>
		`
	})

	Vue.component('achievement', {
		props: ['data'],
		methods: {
			genTooltip(id) {
				let str = '';
				if (DATA.ach[id].secret && !player.achievements[id]) { str += DATA.ach[id].hint; }
				else { str += DATA.ach[id].desc; }
				if (DATA.ach[id].hasReward) { str += (' Reward: ' + DATA.ach[id].reward); }
				if (DATA.ach[id].showEffect) { str += (' Currently: ' + formatDefault2(DATA.ach[id].effect()) + 'x'); }
				return str;
			},
			isNew() {
				return 
			}
		},
		template: `
		<div v-bind:class="{ achievement: true, locked: !player.achievements[data], unlocked: player.achievements[data], new: player.tabNotify.ach[data], achTooltip: true }" v-bind:data-title="genTooltip(data)" v-on:mouseover="mouseoverAchievement(data)" v-html="'<p>'+DATA.ach[data].title+(DATA.ach[data].reward ? '<br>+' : '')+'</p>'"></div>
		`
	})

	Vue.component('achievements', {
		props: [],
		template: `
		<div class="achTable">
			<div v-for="row in DATA.ach.rows" class="achRow">
				<div v-for="col in DATA.ach.cols"><div v-if="player.achievements.rowsUnlocked[row]">
					<achievement :data="row*10+col"></achievement>
				</div></div>
			</div>
		</div>
		`
	})

	

	Vue.component('popups', {
		props: [],
		data() {
			return {
				timedPopups: []
			}
		},
		template: `
		<div id="popupContainer">
			<transition-group name="fade">
				<div v-for="popup, index in timedPopups" v-bind:key="'p'+index">
					<div v-bind:class="popup.className" v-html="popup.popupText"></div>
				</div>
			</transition-group>
		</div>
		`
	})

	//data is the name of the function to call on confirm
	Vue.component('confirm-popup', {
		props: [],
		data() {
			return {
				isActivePop: false,
				confirmText: '',
				fname: '',
				arg: null,
			}
		},
		methods: {
			confirmYes() {
				this.isActivePop = false;
				this.confirmText = '';
				if (this.arg==null) { window[this.fname](); }
				else { window[this.fname](this.arg); }
				this.fname = '';
				this.arg = null;
			},
			confirmNo() {
				this.isActivePop = false;
				this.confirmText = '';
				this.fname = '';
				this.arg = null;
			}
		},
		template: `
		<div v-if="isActivePop" class="confPopup">
			<h3>Are You Sure?</h3>
			<div style="margin: auto;" v-html="confirmText"></div>
			<div style="display: flex; justify-content: center; margin: 10px auto;">
				<div style="flex: 1; max-width: 100px; margin: 5px;"><button class="confirmBut" v-on:click="confirmYes()">YES</button></div>
				<div style="flex: 1; max-width: 100px; margin: 5px;"><button class="confirmBut" v-on:click="confirmNo()">NO</button></div>
			</div>
		</div>
		`
	})
	
	Vue.component('header-popup', {
		props: [],
		data() {
			return {
				isActivePop: false
			}
		},
		template: `
		<div v-if="isActivePop" class="dPopup">
			<div class="headerHeaderContainer">
				<div class="headerPopupHeader">Header Display</div>
				<div class="headerPopupHeaderX"><a href="javascript:closeNormalPopup('hpop')">X</a></div>
			</div>
			<display-toggles></display-toggles>
		</div>
		`
	})

	Vue.component('confirmations-popup', {
		props: [],
		data() {
			return {
				isActivePop: false
			}
		},
		template: `
		<div v-if="isActivePop" class="cPopup">
			<div class="headerHeaderContainer">
				<div class="headerPopupHeader">Confirmations</div>
				<div class="headerPopupHeaderX"><a href="javascript:closeNormalPopup('cpop')">X</a></div>
			</div>
			<confirm-toggles></confirm-toggles>
		</div>
		`
	})

	Vue.component('milestones-popup', {
		props: [],
		data() {
			return {
				isActivePop: false
			}
		},
		template: `
		<div v-if="isActivePop" class="milestonePopup">
			<div class="milestoneHeaderContainer">
				<div class="milestonePopupHeader">MILESTONES</div>
				<div class="milestonePopupHeaderX"><a href="javascript:closeNormalPopup('mpop');">X</a></div>
				<div class="milestonePopupHR"></div>
			</div>
			<milestones></milestones>
		</div>
		`
	})

	Vue.component('hotkeys-display', {
		props: [],
		template: `
		<div class="hotkeysDesc">
			<div><span style="font-size: 18pt; font-weight: bold;">hotkeys: </span>Number Keys 1-8: Buy Single Unit; shift+(1-8): Buy Max Units;</div>
			<div v-for="i in (Object.keys(DATA.hk).length-1)" style="display: inline;">
				<span v-html="DATA.hk[i].key + ': ' + DATA.hk[i].desc + '; '"></span><br v-if="i==4||i==7">
			</div>
			<div style="font-size: 12pt; font-weight: bold;">hotkeys do not trigger if ctrl or command (mac) is pressed.</div>
		</div>
		`
	})

	app = new Vue({
		el: "#app",
		data: {
			player,
			Decimal,
			format,
			formatWhole,
			formatTime,
			//HOTKEYS,
            DATA,
            GAME_DATA,
			/*POPUPS: {
				'achUnlock': false, 
				'mileUnlock': false, 
				'offline': false, 
				'import': false, 
				'export': false, 
				'favs': false, 
				'milestones': false, 
				'confirmations': false, 
				'header': false,
			},
			showNormalPopup,
			closeNormalPopup,
			getCorpsesPerSecond,
			getCorpseMultFromUnits,
			getGalaxiesBonus,
			getWorldsBonus,
			getTotalCorpseMult,
			getBricksPerSecond,
			getAstralNerf,
			getNumCompletedProj,
			isResearchActive,
			isResearchCompleted,
			getTheoremBoostW,
			getTheoremBoostC,
			getNumAchievements,
			getNumAchRows,
			getAchievementEffect,
			getAchievementBoost,
			//getEssenceProdAfterSlider,
			getTrueTimeBuff,
			getAntiTimeBuff,
			getResearchPerSecond,
			getCurrentGoal,
			tabButtonClick,
			generateHelpText,
			generateLastAsc,
			generateAscAvgs,
			generateAscString,
			generateLastSac,
			generateSacAvgs,
			generateSacString,
			updateOnAntiChange,
			updateOnTrueChange,
			canAffordRefinery,
			getRefineryCost,
			getEmittersPerLevel,
			updateEmitterAmount,
			emittersError: false,
			emitterAmount: player.emittersAmount,
			galSelected: player.activeGalaxies[0],
			isOffline: false,
			allBuyersRadio: 'all',
			respecNextGal: false,
			respecNextSac: false,
			dontRespec: player.dontResetSlider,
			sliderVal: player.antiPercent,
			trueSliderVal: player.trueEmitters,
			antiSliderVal: player.antiEmitters,
			shadowStyle: '',
			devSpeed: 1,
			showHelp: false,
			importing: false,
			exporting: false,
			exportTextArea: '',*/
		},
	})

    
}