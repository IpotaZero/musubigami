import { Dom } from "./Dom"
import { LocalStorage } from "./LocalStorage"
import { SceneChanger } from "./Scenes/SceneChanger"
import { BGM } from "./utils/BGM/BGM"

import { Graph } from "./utils/Graph"
import { KeyboardOperation } from "./utils/KeyboardOperation"
import { PsdElement } from "./utils/PsdElement"
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

    await document.fonts.ready

    const { SceneTitle } = await import("./Scenes/SceneTitle.js")
    SceneChanger.init(new SceneTitle())
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
