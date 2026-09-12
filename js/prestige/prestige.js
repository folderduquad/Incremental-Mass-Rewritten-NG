const REINCARNATION = {
    req: E('1e308'),
    mils: [
        [E(1), `Reach <b>1</b> reincarnation to gain a permanent <b>×1e100</b> Inf-speed boost.`, `infSpeed`],
        [E(2), `Reach <b>2</b> reincarnations to gain a permanent <b>×1e200</b> Quantum-speed boost.`, `quSpeed`],
        [E(3), `Reach <b>3</b> reincarnations to gain a permanent <b>^100</b> mass gain boost.`, `massGain`],
    ],
    can() {
        return hasInfUpgrade(16) && player.inf.points.gte(this.req)
    },
    gain() {
        if (!this.can()) return E(0)
        let x = player.inf.points.max(1).log10().div(308).floor()
        x = x.max(1)
        if (player.chal && player.chal.comps && player.chal.comps[20] && player.chal.comps[20].gte(1)) x = x.mul(2)
        return x
    },
    reached(i) {
        return player.reinc.points.gte(this.mils[i][0]) && player.reinc.count.gte(1)
    },
    getInfSpeedMult() {
        let x = E(1)
        if (this.reached(0)) x = x.mul(1e100)
        if (this.reached(1)) x = x.mul(1e200)
        if (this.reached(2)) x = x.pow(2)
        if (player.chal && player.chal.comps && player.chal.comps[20] && player.chal.comps[20].gte(1)) x = x.pow(10)
        return x
    },
    getQUSpeedMult() {
        let x = E(1)
        if (this.reached(1)) x = x.mul(1e300)
        if (this.reached(2)) x = x.pow(10)
        if (player.chal && player.chal.comps && player.chal.comps[20] && player.chal.comps[20].gte(1)) x = x.pow(10)
        return x
    },
    getMassGainMult() {
        let x = E(1)
        if (this.reached(2)) x = x.pow(100)
        if (player.chal && player.chal.comps && player.chal.comps[20] && player.chal.comps[20].gte(1)) x = x.pow(10)
        return x
    },
    updateTemp() {
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
    },
    setupHTML() {
        // Preserve the existing Reincarnation page HTML instead of wiping the milestones panel.
    },
    updateHTML() {
        if (!tmp.el || !tmp.el.reinc_milestones_table || !tmp.el.reinc_count) return

        tmp.el.reinc_count.setHTML(player.reinc.count.format(0))

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
        let infUpg = player.inf && Array.isArray(player.inf.upg) ? player.inf.upg.slice() : []

        let g = this.gain()
        player.reinc.points = player.reinc.points.add(g)
        player.reinc.count = player.reinc.count.add(1)
        player.reinc.total = player.reinc.total.add(1)
        player.reinc.reached = true

        player.mass = E(0)

        player.ranks.rank = E(0)
        player.ranks.tier = E(0)
        player.ranks.tetr = E(0)
        player.ranks.pent = E(0)
        player.ranks.hex = E(0)
        player.ranks.beyond = E(0)

        for (let i = 0; i < PRESTIGES.names.length; i++) player.prestiges[i] = E(0)

        player.rp.points = E(0)
        player.bh.mass = E(0)
        player.bh.dm = E(0)
        player.atom.points = E(0)
        player.atom.quarks = E(0)
        player.atom.atomic = E(0)
        player.atom.particles = [E(0), E(0), E(0)]
        player.atom.powers = [E(0), E(0), E(0)]

        player.qu = getQUSave()
        player.dark = getDarkSave()
        player.inf = getInfSave()
        player.inf.upg = infUpg

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
    }
}
