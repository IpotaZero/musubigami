import { Dom } from "./Dom"
import { LocalStorage } from "./LocalStorage"
import { SceneChanger } from "./Scenes/SceneChanger"
import { Awaits } from "./utils/Awaits"
import { BGM } from "./utils/BGM/BGM"

import { Graph } from "./utils/Graph"
import { KeyboardOperation } from "./utils/KeyboardOperation"
import { PsdElement } from "./utils/PsdElement/PsdElement"
import { Serif } from "./utils/Serif"

PsdElement
Graph

document.addEventListener("DOMContentLoaded", async () => {
    BGM.init()
    Serif.init()
    Dom.init()
    KeyboardOperation.init()

    Dom.container.innerHTML = '<p class="loading">Loading</p>'

    const params = new URLSearchParams(window.location.search)

    if (params.get("delete") === "true") {
        LocalStorage.clear()
    }

    await Awaits.timeOver(5000, document.fonts.ready, () => {
        console.warn("fontの読み込みに時間掛かり過ぎ! スキップしました。")
    })

    const { SceneTitle } = await import("./Scenes/SceneTitle.js")
    SceneChanger.init(new SceneTitle())
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
