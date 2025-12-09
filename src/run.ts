import { Dom } from "./Dom"
import { LocalStorage } from "./LocalStorage"
import { SceneChanger } from "./Scenes/SceneChanger"

import { Graph } from "./utils/Graph"
import { KeyboardOperation } from "./utils/KeyboardOperation"
import { Serif } from "./utils/Serif"

Graph

document.addEventListener("DOMContentLoaded", async () => {
    Serif.init()
    Dom.init()
    // KeyboardOperation.init()

    const params = new URLSearchParams(window.location.search)

    if (params.get("delete") === "true") {
        LocalStorage.clear()
    }

    const { SceneTitle } = await import("./Scenes/SceneTitle")
    SceneChanger.init(new SceneTitle())
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
