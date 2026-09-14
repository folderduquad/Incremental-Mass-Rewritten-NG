const CHAL_HIDE = {
    getRemoved() {
        if (!player.reinc) player.reinc = getReincSave()
        if (!player.reinc.chalHide) player.reinc.chalHide = []
        return player.reinc.chalHide
    },
    hasRemoved(x) {
        return this.getRemoved().includes(x)
    },
    count() {
        return E(this.getRemoved().length)
    },
    getGainMult() {
        let cnt = this.count()
        if (cnt.lte(0)) return E(1)
        return E(10).pow(cnt)
    },
    toggle(x) {
        if (!player.reinc) player.reinc = getReincSave()
        if (!player.reinc.chalHide) player.reinc.chalHide = []
        let arr = this.getRemoved()
        let idx = arr.indexOf(x)
        if (idx >= 0) arr.splice(idx, 1)
        else arr.push(x)
    },
    updateHTML() {
        if (!tmp.el || !tmp.el.reinc_chal_hide_panel) return

        let h = `<div style="width:100%;margin:5px 0px;padding:8px 0px;background-color:#141;font-size:14px;">
            <h2>Challenge Hider</h2>
            <div>Hidden Challenges: <b>${this.count().format(0)}</b></div>
            <div>Reincarnation gain bonus: <b>x${format(this.getGainMult())}</b></div>
            <br>
            <div class="table_center">`

        for (let x = 1; x <= CHALS.cols; x++) {
            let meta = CHALS[x]
            let title = meta && meta.title ? meta.title : `Challenge ${x}`
            let stopped = this.hasRemoved(x)
            h += `<button class="btn" style="margin:3px;${stopped ? 'border-color: #5f5; color: #9f9;' : ''}" onclick="CHAL_HIDE.toggle(${x}); REINCARNATION.updateHTML();">
                    <span>${stopped ? 'Restore' : 'Remove'}</span> ${x}: ${title}
                </button>`
        }

        h += `</div></div>`
        tmp.el.reinc_chal_hide_panel.setHTML(h)
    },
}
