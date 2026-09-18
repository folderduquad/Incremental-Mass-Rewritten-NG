if (typeof Decimal === "undefined" && typeof XMLHttpRequest !== "undefined") {
    try {
        let req = new XMLHttpRequest()
        req.open("GET", "js/break_eternity.js", false)
        req.send(null)
        if (req.status === 200 || req.status === 0) eval(req.responseText)
    } catch (e) {
        console.warn("Failed to inject break_eternity.js into REINCARNATION preload:", e)
    }
}

const REINCARNATION = {
    req: E('1e308'),
    mils: [
        [E(1), `Reach <b>1</b> reincarnation to gain a permanent <b>×1e100->1e200->1e600</b> Inf-speed boost.`, `infSpeed`],
        [E(2), `Reach <b>2</b> reincarnations to gain a permanent <b>×ee5->ee10</b> Quantum-speed boost.`, `quSpeed`],
        [E(3), `Reach <b>3</b> reincarnations to gain a permanent <b>^100</b> mass gain boost.`, `massGain`],
        [E(4), `Reach <b>4</b> reincarnations to multiply <b>Supernova gain</b> by <b>×1e50</b>.`, `supernovaGain`],
        [E(5), `Reach <b>5</b> reincarnations to multiply <b>Corrupted Stars growth speed</b> by <b>×1e20</b>.`, `corruptedStarSpeed`],
    ],
    can() {
        return hasInfUpgrade(16) && player.inf.points.gte(this.req)
    },
    gain() {
        if (!this.can()) return E(0)
        let x = player.inf.points.max(1).log10().div(308).floor()
        x = x.max(1)
        if (player.chal && player.chal.active == 20 && player.chal.comps && player.chal.comps[20] && player.chal.comps[20].gte(1)) x = x.mul(2)
        if (typeof CHAL_HIDE !== 'undefined') x = x.mul(CHAL_HIDE.getGainMult())
        return x
    },
    reached(i) {
        return player.reinc.count.gte(this.mils[i][0]) && player.reinc.count.gte(1)
    },
    getInfSpeedMult() {
        let x = E(1)
        if (this.reached(0)) x = x.mul(1e100)
        if (this.reached(1)) x = x.mul(1e200)
        if (this.reached(2)) x = x.pow(2)
        if (player.chal && player.chal.active == 20) x = x.pow(10)
        return x
    },
    getQUSpeedMult() {
        let x = E(1)
        if (this.reached(1)) x = x.mul('ee5')
        if (this.reached(2)) x = x.pow(1e5)
        if (player.chal && player.chal.active == 20) x = x.pow(1e10)
        return x
    },
    getMassGainMult() {
        let x = E(1)
        if (this.reached(2)) x = x.pow(1e100)
        if (player.chal && player.chal.active == 20) x = x.pow(1e100)
        return x
    },  
    getSupernovaGainMult() {
        let x = E(1)
        if (this.reached(3)) x = x.mul(1e50)
        if (player.chal && player.chal.active == 20) x = x.pow(10)
        return x
    },
    getCorruptedStarSpeedMult() {
        let x = E(1)
        if (this.reached(4)) x = x.mul(1e20)
        if (player.chal && player.chal.active == 20) x = x.pow(10)
        return x
    },    updateTemp() {
        tmp.reinc = tmp.reinc || {}
        tmp.reinc.count = player.reinc.count
        tmp.reinc.total = player.reinc.total
        tmp.reinc.points = player.reinc.points
        tmp.reinc.reached = player.reinc.reached
        tmp.reinc.mil_reached = []
        for (let i = 0; i < this.mils.length; i++) tmp.reinc.mil_reached[i] = this.reached(i)
        tmp.reinc.infSpeedMult = this.getInfSpeedMult()
        tmp.reinc.quSpeedMult = this.getQUSpeedMult()
        tmp.reinc.massGainMult = this.getMassGainMult()
        tmp.reinc.supernovaGainMult = this.getSupernovaGainMult()
        tmp.reinc.corruptedStarSpeedMult = this.getCorruptedStarSpeedMult()
    },
    setupHTML() {
        // Preserve the existing Reincarnation page HTML instead of wiping the milestones panel.
    },
    updateHTML() {
        if (!tmp.el || !tmp.el.reinc_milestones_table || !tmp.el.reinc_count) return

        tmp.el.reinc_count.setHTML(player.reinc.count.format(0))

        if (tmp.tab == 9 && tmp.stab && tmp.stab[9] == 1 && typeof CHAL_HIDE !== 'undefined') {
            CHAL_HIDE.updateHTML()
            return
        }

        let h = ''
        for (let i = 0; i < this.mils.length; i++) {
            let req = this.mils[i][0]
            let done = player.reinc.count.gte(req)
            h += `<div id="reinc_milestone_${i}" style="width: 100%; margin: 5px 0px; padding: 8px 0px; background-color: ${done ? '#2f22' : '#4442'}; font-size: 14px;">
                <h2>Reincarnation Milestone <span id="reinc_mil_goal_${i}">${req.format(0)}</span></h2><br><br>
                ${this.mils[i][1]}
            </div>`
        }
        tmp.el.reinc_milestones_table.setHTML(h)
    },
    doReset() {
        if (!player.reinc) player.reinc = getReincSave()

        let oldTab = tmp.tab
        let oldStab8 = tmp.stab && tmp.stab[8] !== undefined ? tmp.stab[8] : 4

        let oldReinc = player.reinc
        let oldQu = player.qu || getQUSave()
        let oldDark = player.dark || getDarkSave()
        let oldInf = player.inf || getInfSave()

        let g = this.gain()
        let newReinc = getReincSave()
        newReinc.count = oldReinc.count.add(1)
        newReinc.total = oldReinc.total.add(1)
        newReinc.reached = true
        newReinc.points = oldReinc.points.add(g)
        newReinc.chalHide = oldReinc.chalHide ? oldReinc.chalHide.slice() : []

        let newPlayer = getPlayerData()
        newPlayer.reinc = newReinc

        let oldQC = oldQu.qc
        let oldDarkRun = oldDark.run
        let oldQuPrimTheorems = oldQu.prim.theorems
        let oldQuEn = oldQu.en
        let oldInfTheoremSystems = {
            core: oldInf.core,
            inv: oldInf.inv,
            pre_theorem: oldInf.pre_theorem,
            fragment: oldInf.fragment,
            pt_choosed: oldInf.pt_choosed,
            theorem: oldInf.theorem,
        }

        player = newPlayer
        player.qu.qc = oldQC
        player.dark.run = oldDarkRun
        player.qu.prim.theorems = oldQuPrimTheorems
        player.qu.en = oldQuEn
        player.inf.core = oldInfTheoremSystems.core
        player.inf.inv = oldInfTheoremSystems.inv
        player.inf.pre_theorem = oldInfTheoremSystems.pre_theorem
        player.inf.fragment = oldInfTheoremSystems.fragment
        player.inf.pt_choosed = oldInfTheoremSystems.pt_choosed
        player.inf.theorem = oldInfTheoremSystems.theorem

        tmp.tab = oldTab
        tmp.stab[8] = oldStab8

        return true
    },
    go() {
        if (this.can()) this.doReset()
    },
}

function getReincSave() {
    return {
        count: E(0),
        total: E(0),
        reached: false,
        points: E(0),
        chalHide: [],
    }
}
