// mirror.js - 镜子能量系统（通过 C20 质量数量获得）
const MIRROR = {
    unl() { 
    try { 
        if (!player.chal || !player.chal.comps || !player.chal.comps[20]) return false
        return player.chal.comps[20].gte(1) 
    } catch(e) { return false }
},
    
    // 获取当前 C20 的质量数量
    c20Mass() {
        if (player.chal.active == 20) {
            return player.mass.max(tmp.chal && tmp.chal.bulk && tmp.chal.bulk[20] ? tmp.chal.bulk[20] : E(1))
        }
        return player.chal.comps[20]
    },
    
    gain() {
        if (!this.unl()) return E(0)
        
        let c20Mass = this.c20Mass()
        
        // 核心公式：基于 C20 质量的 slog
        let x = c20Mass.max(1).slog(10)
        x = x.pow(3).sub(1).max(0)
        x=x.mul(200)
        
        // 升级加成
        let ue = tmp.mirror.upgEff || []
        if (ue[0]) x = x.mul(ue[0])
        
        // 碎片加成
        let fe = tmp.mirror.fragEff || {}
        if (fe.mirrorGain) x = x.mul(fe.mirrorGain)
        
        // Reincarnation 加成
        if (typeof REINCARNATION !== 'undefined') {
            x = x.mul(REINCARNATION.getMassGainMult().max(1).log10().add(1))
        }
        
        return x.floor()
    },
    
    fragGain() {
        if (!this.unl()) return E(0)
        let x = tmp.mirror.gain.max(1).log10().pow(2)
        let ue = tmp.mirror.upgEff || []
        if (ue[1]) x = x.mul(ue[1])
        let fe = tmp.mirror.fragEff || {}
        if (fe.fragGain) x = x.mul(fe.fragGain)
        x=x.mul(100)
        return x.floor()
    },
    
    canReset() {
        return this.unl() && tmp.mirror.gain.gte(1)
    },
    
    reset() {
        if (!this.canReset()) return
        if (player.confirms.mirror) {
            createConfirm("Are you sure you want to Mirror? This will reset all pre-Infinity and Infinity content!", 'mirror', () => MIRROR.doReset())
        } else {
            this.doReset()
        }
    },
    
    doReset() {
        player.mirror.points = player.mirror.points.add(tmp.mirror.gain)
        player.mirror.total = player.mirror.total.add(tmp.mirror.gain)
        
        player.mirror.fragments = player.mirror.fragments.add(tmp.mirror.fragGain)
        player.mirror.totalFrag = player.mirror.totalFrag.add(tmp.mirror.fragGain)
        
        player.mirror.bestC20Mass = player.mirror.bestC20Mass.max(this.c20Mass())
        
        INF.doReset()
        
        addQuote(13)
    },
    
    effect() {
        if (!this.unl()) return E(1)
        
        let x = E(1)
        let ue = tmp.mirror.upgEff || []
        if (ue[2]) x = x.mul(player.mirror.points.add(1).root(ue[2]))
        
        let fe = tmp.mirror.fragEff || {}
        if (fe.global) x = x.mul(fe.global)
        
        return x
    },
    
    upgs: {
        buy(i) {
            let u = this.ids[i]
            if (tmp.mirror.upgs[i].can) {
                player.mirror.upgs[i] = player.mirror.upgs[i].add(1)
                if (u.maxLvl && player.mirror.upgs[i].gt(u.maxLvl)) {
                    player.mirror.upgs[i] = E(u.maxLvl)
                }
            }
        },
        ids: [
            {
                desc: "Mirror Energy gain is boosted based on its own amount.",
                maxLvl: 10,
                cost(x) { return E(10).pow(x.add(1).pow(1.5)).mul(5) },
                bulk() { return player.mirror.points.max(1).div(5).log(10).max(0).root(1.5).sub(1).max(0).floor() },
                effect(x) { return E(1).add(x.mul(0.25)) },
                effDesc(x) { return "×" + format(x) + " to mirror energy gain" },
            },
            {
                desc: "Mirror Shard gain is boosted.",
                maxLvl: 10,
                cost(x) { return E(100).pow(x.add(1).pow(1.75)).mul(20) },
                bulk() { return player.mirror.points.max(1).div(20).log(100).max(0).root(1.75).sub(1).max(0).floor() },
                effect(x) { return E(2).pow(x).softcap(1e6, 0.75, 0) },
                effDesc(x) { return "×" + format(x) + " to shard gain" + x.softcapHTML(1e6) },
            },
            {
                desc: "Mirror Energy's global effect is stronger.",
                maxLvl: 20,
                cost(x) { return E(1000).pow(x.add(1).pow(2)).mul(100) },
                bulk() { return player.mirror.points.max(1).div(100).log(1000).max(0).root(2).sub(1).max(0).floor() },
                effect(x) { return E(2).add(x.mul(0.1)) },
                effDesc(x) { return "^" + format(x) + " to global effect" },
            },
            {
                desc: "Unlock the Mirror Forge (convert between energy and shards).",
                maxLvl: 1,
                cost(x) { return E(1e10) },
                bulk() { return player.mirror.points.gte(1e10) ? E(1) : E(0) },
            },
            {
                desc: "Mirror Shards boost Reincarnation gain.",
                maxLvl: 5,
                cost(x) { return E(1e20).pow(x.add(1)).mul(1e12) },
                bulk() { return player.mirror.points.max(1).div(1e12).log(1e20).max(0).sub(1).max(0).floor() },
                effect(x) { return E(1).add(x.mul(0.5)) },
                effDesc(x) { return "×" + format(x) + " to reincarnation gain" },
            },
            {
                desc: "Mirror Energy boosts all Infinity Theorem effects.",
                maxLvl: 10,
                cost(x) { return E(1e30).pow(x.add(1).pow(1.25)).mul(1e20) },
                bulk() { return player.mirror.points.max(1).div(1e20).log(1e30).max(0).root(1.25).sub(1).max(0).floor() },
                effect(x) { return E(1).add(x.mul(0.2)) },
                effDesc(x) { return "×" + format(x) + " to theorem effects" },
            },
            {
                desc: "Mirror Shards passively generate Mirror Energy.",
                maxLvl: 1,
                cost(x) { return E(1e50) },
                bulk() { return player.mirror.points.gte(1e50) ? E(1) : E(0) },
                effect(x) { return x.gt(0) ? player.mirror.fragments.add(1).log10().pow(2).div(100) : E(0) },
                effDesc(x) { return "+" + format(x) + " mirror energy/sec" },
            },
            {
                desc: "Mirror Energy boosts Dark Ray gain.",
                maxLvl: 10,
                cost(x) { return E(1e80).pow(x.add(1).pow(1.5)).mul(1e60) },
                bulk() { return player.mirror.points.max(1).div(1e60).log(1e80).max(0).root(1.5).sub(1).max(0).floor() },
                effect(x) { return E(2).pow(x.mul(1.5)).softcap(1e15, 0.5, 0) },
                effDesc(x) { return "×" + format(x) + " to dark ray gain" + x.softcapHTML(1e15) },
            },
        ],
    },
    
    fragUpgs: {
        buy(i) {
            let u = this.ids[i]
            if (tmp.mirror.fragUpgs[i].can) {
                player.mirror.fragUpgs[i] = player.mirror.fragUpgs[i].add(1)
                if (u.maxLvl && player.mirror.fragUpgs[i].gt(u.maxLvl)) {
                    player.mirror.fragUpgs[i] = E(u.maxLvl)
                }
            }
        },
        ids: [
            {
                desc: "Mirror Shards boost themselves.",
                maxLvl: 10,
                cost(x) { return E(10).pow(x.add(1).pow(2)).mul(100) },
                bulk() { return player.mirror.fragments.max(1).div(100).log(10).max(0).root(2).sub(1).max(0).floor() },
                effect(x) { return E(1.5).pow(x) },
                effDesc(x) { return "×" + format(x) + " to shard gain" },
            },
            {
                desc: "Mirror Shards boost all resource gain.",
                maxLvl: 10,
                cost(x) { return E(100).pow(x.add(1).pow(1.75)).mul(1e4) },
                bulk() { return player.mirror.fragments.max(1).div(1e4).log(100).max(0).root(1.75).sub(1).max(0).floor() },
                effect(x) { return E(1).add(x.mul(0.1)) },
                effDesc(x) { return "^" + format(x) + " to global effect" },
            },
            {
                desc: "Unlock a new Mirror Energy upgrade.",
                maxLvl: 1,
                cost(x) { return E(1e8) },
                bulk() { return player.mirror.fragments.gte(1e8) ? E(1) : E(0) },
            },
            {
                desc: "Mirror Shards boost Galactic Prestige resource gain.",
                maxLvl: 10,
                cost(x) { return E(1e6).pow(x.add(1).pow(1.5)).mul(1e5) },
                bulk() { return player.mirror.fragments.max(1).div(1e5).log(1e6).max(0).root(1.5).sub(1).max(0).floor() },
                effect(x) { return E(2).pow(x).softcap(1e10, 0.6, 0) },
                effDesc(x) { return "×" + format(x) + " to GP resource gain" + x.softcapHTML(1e10) },
            },
            {
                desc: "Mirror Shards boost Ascension base.",
                maxLvl: 10,
                cost(x) { return E(1e12).pow(x.add(1).pow(1.25)).mul(1e8) },
                bulk() { return player.mirror.fragments.max(1).div(1e8).log(1e12).max(0).root(1.25).sub(1).max(0).floor() },
                effect(x) { return E(1).add(x.mul(0.05)) },
                effDesc(x) { return "+" + format(x.mul(100)) + "% to ascension base" },
            },
        ],
    },
    
    forge: {
        unl() { return player.mirror.upgs[3].gte(1) },
        convert(amt) {
            if (!this.unl()) return
            let cost = E(amt).min(player.mirror.fragments)
            let gain = cost.pow(0.9).mul(10)
            player.mirror.fragments = player.mirror.fragments.sub(cost)
            player.mirror.points = player.mirror.points.add(gain)
        },
        reverse(amt) {
            if (!this.unl()) return
            let cost = E(amt).min(player.mirror.points)
            let gain = cost.pow(0.8).mul(5)
            player.mirror.points = player.mirror.points.sub(cost)
            player.mirror.fragments = player.mirror.fragments.add(gain)
        },
        ratio() {
            return tmp.mirror.fragEff.forge || E(1)
        },
    },
}

function getMirrorSave() {
    return {
        points: E(0),
        total: E(0),
        fragments: E(0),
        totalFrag: E(0),
        bestC20Mass: E(0),
        upgs: new Array(MIRROR.upgs.ids.length).fill(E(0)),
        fragUpgs: new Array(MIRROR.fragUpgs.ids.length).fill(E(0)),
        auto: false,
    }
}

function updateMirrorTemp() {
    try {
        if (!tmp.mirror) tmp.mirror = {}
        if (!player.mirror) player.mirror = getMirrorSave()

        // 补全旧存档缺失的数组
        if (!player.mirror.upgs) player.mirror.upgs = new Array(8).fill(E(0))
        if (!player.mirror.fragUpgs) player.mirror.fragUpgs = new Array(5).fill(E(0))
        if (!tmp.mirror.upgs) tmp.mirror.upgs = []
        if (!tmp.mirror.fragUpgs) tmp.mirror.fragUpgs = []

        tmp.mirror.unl = MIRROR.unl()
        if (!tmp.mirror.unl) {
            tmp.mirror.effect = E(1)
            tmp.mirror.upgEff = []
            tmp.mirror.fragEff = { mirrorGain: E(1), fragGain: E(1), global: E(1), forge: E(1) }
            return
        }

        // 1) 先算升级效果（因为 gain 依赖 upgEff）
        let upgEff = []
        for (let x = 0; x < MIRROR.upgs.ids.length; x++) {
            let u = MIRROR.upgs.ids[x]
            if (!tmp.mirror.upgs[x]) tmp.mirror.upgs[x] = {}
            let lvl = player.mirror.upgs[x] || E(0)
            tmp.mirror.upgs[x].cost = u.cost(lvl)
            tmp.mirror.upgs[x].bulk = u.bulk().min(u.maxLvl || EINF)
            tmp.mirror.upgs[x].can = player.mirror.points.gte(tmp.mirror.upgs[x].cost) && lvl.lt(u.maxLvl || EINF)
            if (u.effect) {
                tmp.mirror.upgs[x].eff = u.effect(lvl)
                upgEff[x] = tmp.mirror.upgs[x].eff
            }
        }
        tmp.mirror.upgEff = upgEff

        // 2) 碎片升级 + 碎片效果（合并，只循环一次）
        let fragEff = { mirrorGain: E(1), fragGain: E(1), global: E(1), forge: E(1) }
        for (let x = 0; x < MIRROR.fragUpgs.ids.length; x++) {
            let u = MIRROR.fragUpgs.ids[x]
            if (!tmp.mirror.fragUpgs[x]) tmp.mirror.fragUpgs[x] = {}
            let lvl = player.mirror.fragUpgs[x] || E(0)
            tmp.mirror.fragUpgs[x].cost = u.cost(lvl)
            tmp.mirror.fragUpgs[x].bulk = u.bulk().min(u.maxLvl || EINF)
            tmp.mirror.fragUpgs[x].can = player.mirror.fragments.gte(tmp.mirror.fragUpgs[x].cost) && lvl.lt(u.maxLvl || EINF)
            if (u.effect) tmp.mirror.fragUpgs[x].eff = u.effect(lvl)
        }
        if (player.mirror.fragUpgs[0].gte(1)) fragEff.fragGain = tmp.mirror.fragUpgs[0].eff
        if (player.mirror.fragUpgs[1].gte(1)) fragEff.global = tmp.mirror.fragUpgs[1].eff
        tmp.mirror.fragEff = fragEff

        // 3) 再算 gain（依赖 upgEff 和 fragEff）
        tmp.mirror.gain = MIRROR.gain()
        tmp.mirror.fragGain = MIRROR.fragGain()
        tmp.mirror.effect = MIRROR.effect()
        tmp.mirror.canReset = MIRROR.canReset()

        tmp.mirror.c20Mass = MIRROR.c20Mass()
        tmp.mirror.bestC20Mass = player.mirror.bestC20Mass
    } catch(e) {
        console.error("updateMirrorTemp error:", e)
        if (!tmp.mirror) tmp.mirror = {}
        tmp.mirror.unl = false
        tmp.mirror.gain = E(0)
        tmp.mirror.fragGain = E(0)
        tmp.mirror.effect = E(1)
        tmp.mirror.canReset = false
    }
}

function setupMirrorHTML() {
    let mirror_table = new Element("mirror_upgs_table")
    if (!mirror_table.el) return
    let table = ""
    for (let i = 0; i < MIRROR.upgs.ids.length; i++) {
        let u = MIRROR.upgs.ids[i]
        table += `
        <button onclick="MIRROR.upgs.buy(${i})" class="btn full mirror" id="mirror_upg${i}_div" style="font-size: 11px;">
            <div style="min-height: 80px">
                ${(u.maxLvl || 1/0) > 1 ? `[Level <span id="mirror_upg${i}_lvl"></span>]<br>` : ""}
                ${u.desc}<br>
                ${u.effDesc ? `Currently: <span id="mirror_upg${i}_eff"></span>` : ""}
            </div>
            <span id="mirror_upg${i}_cost"></span>
        </button>`
    }
    mirror_table.setHTML(table)
    
    let frag_table = new Element("mirror_frag_table")
    if (!frag_table.el) return
    table = ""
    for (let i = 0; i < MIRROR.fragUpgs.ids.length; i++) {
        let u = MIRROR.fragUpgs.ids[i]
        table += `
        <button onclick="MIRROR.fragUpgs.buy(${i})" class="btn full mirror_frag" id="mirror_frag${i}_div" style="font-size: 11px;">
            <div style="min-height: 80px">
                ${(u.maxLvl || 1/0) > 1 ? `[Level <span id="mirror_frag${i}_lvl"></span>]<br>` : ""}
                ${u.desc}<br>
                ${u.effDesc ? `Currently: <span id="mirror_frag${i}_eff"></span>` : ""}
            </div>
            <span id="mirror_frag${i}_cost"></span>
        </button>`
    }
    frag_table.setHTML(table)
}

function updateMirrorHTML() {
    try {
        if (!tmp.mirror || !tmp.mirror.unl) {
            if (tmp.el && tmp.el.mirror_tab) tmp.el.mirror_tab.setDisplay(false)
            return
        }
        // ... 原代码 ...
    } catch(e) {
        console.error("updateMirrorHTML error:", e)
    }
    if (!tmp.mirror || !tmp.mirror.unl) {
        if (tmp.el && tmp.el.mirror_tab) tmp.el.mirror_tab.setDisplay(false)
        return
    }
    if (tmp.el && tmp.el.mirror_tab) tmp.el.mirror_tab.setDisplay(true)
    if (!tmp.el || !tmp.el.mirror_points) return
    
    tmp.el.mirror_points.setHTML(format(player.mirror.points) + " " + formatGain(player.mirror.points, tmp.mirror.gain.mul(tmp.preInfGlobalSpeed)))
    tmp.el.mirror_total.setHTML(format(player.mirror.total))
    tmp.el.mirror_frag.setHTML(format(player.mirror.fragments) + " " + formatGain(player.mirror.fragments, tmp.mirror.fragGain.mul(tmp.preInfGlobalSpeed)))
    tmp.el.mirror_frag_total.setHTML(format(player.mirror.totalFrag))
    tmp.el.mirror_effect.setHTML(format(tmp.mirror.effect) + "x")
    tmp.el.mirror_gain.setHTML(format(tmp.mirror.gain))
    tmp.el.mirror_fragGain.setHTML(format(tmp.mirror.fragGain))
    tmp.el.mirror_c20_mass.setHTML(formatMass(tmp.mirror.c20Mass))
    tmp.el.mirror_best_c20.setHTML(formatMass(tmp.mirror.bestC20Mass))
    tmp.el.mirror_reset_btn.setClasses({btn: true, full: true, mirror: true, locked: !tmp.mirror.canReset})
    
    for (let x = 0; x < MIRROR.upgs.ids.length; x++) {
        let u = MIRROR.upgs.ids[x]
        tmp.el["mirror_upg"+x+"_div"].setClasses({btn: true, full: true, mirror: true, locked: !tmp.mirror.upgs[x].can})
        if ((u.maxLvl || 1/0) > 1) tmp.el["mirror_upg"+x+"_lvl"].setTxt(format(player.mirror.upgs[x], 0) + (u.maxLvl !== undefined ? " / " + format(u.maxLvl, 0) : ""))
        if (u.effDesc) tmp.el["mirror_upg"+x+"_eff"].setHTML(u.effDesc(tmp.mirror.upgs[x].eff))
        tmp.el["mirror_upg"+x+"_cost"].setTxt(player.mirror.upgs[x].lt(u.maxLvl || EINF) ? "Cost: " + format(tmp.mirror.upgs[x].cost) + " Mirror Energy" : "")
    }
    
    for (let x = 0; x < MIRROR.fragUpgs.ids.length; x++) {
        let u = MIRROR.fragUpgs.ids[x]
        tmp.el["mirror_frag"+x+"_div"].setClasses({btn: true, full: true, mirror_frag: true, locked: !tmp.mirror.fragUpgs[x].can})
        if ((u.maxLvl || 1/0) > 1) tmp.el["mirror_frag"+x+"_lvl"].setTxt(format(player.mirror.fragUpgs[x], 0) + (u.maxLvl !== undefined ? " / " + format(u.maxLvl, 0) : ""))
        if (u.effDesc) tmp.el["mirror_frag"+x+"_eff"].setHTML(u.effDesc(tmp.mirror.fragUpgs[x].eff))
        tmp.el["mirror_frag"+x+"_cost"].setTxt(player.mirror.fragUpgs[x].lt(u.maxLvl || EINF) ? "Cost: " + format(tmp.mirror.fragUpgs[x].cost) + " Mirror Shards" : "")
    }
    
    tmp.el.mirror_forge_div.setDisplay(MIRROR.forge.unl())
    if (MIRROR.forge.unl()) {
        tmp.el.mirror_forge_ratio.setHTML(format(MIRROR.forge.ratio()))
    }
}