import { Dom } from "../Dom"
import { BGM } from "../utils/BGM/BGM"
import { Serif } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"
import { MapConfig } from "./SceneMap/MapConfig"
import { SceneMap } from "./SceneMap/SceneMap"

export class SceneEnd extends Scene {
    ready: Promise<void>

    constructor() {
        super()

        this.ready = Promise.resolve()
        this.#setup()
    }

    async #setup() {
        Dom.container.innerHTML = ""
        BGM.fadeOut(5000).then(() => {
            BGM.stop()
        })

        // @ts-ignore
        const commands = await import(`../../assets/stories/story.js`)
        await Serif.say(...commands.default[MapConfig.BOSSES[3]].end)

        const { SceneTitle } = await import("./SceneTitle.js")
        await SceneChanger.goto(() => new SceneTitle(), { msIn: 1500, msOut: 1500 })
    }
}
