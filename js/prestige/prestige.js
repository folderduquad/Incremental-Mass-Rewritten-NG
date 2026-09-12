const REINCARNATION = {
    req: E('1e1800'),
    can() {
        return player.mass.gte(this.req)
    },
    gain() {
        if (!this.can()) return E(0)
        let x = player.inf.points.max(1).add(10).log10().div(308).add(1).floor()
        return x.max(1)
    },
    doReset() {
        if (!player.reinc) player.reinc = getReincSave()

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
    }
}
