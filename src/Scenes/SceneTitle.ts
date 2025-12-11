import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
import { Awaits } from "../utils/Awaits"
import { KeyboardOperation } from "../utils/KeyboardOperation"
import { Pages } from "../utils/Pages"
import { Serif } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"

export class SceneTitle extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()

    constructor() {
        super()
        this.ready = this.#setup()
    }

    async #setup() {
        const html = await fetch("pages/title.html").then((res) => res.text())
        await this.#pages.load(Dom.container, html)

        this.#setupFirstPage()

        this.#pages.on(".*", (pages) => {
            const page = pages.pages.get(pages.getCurrentPageId())
            if (!page) return
            // KeyboardOperation.update(page)
        })

        this.#pages.before("start", async (pages) => {
            const { SceneMap } = await import("./SceneMap")
            await SceneChanger.goto(() => new SceneMap(0))

            if (!LocalStorage.getFlags().includes("始まり")) {
                this.#始まり()
            }

            return true
        })

        this.#pages.before("delete-data", async () => {
            const choice = await Serif.ask("ほんとに?", ["はい", "いいえ"])

            if (choice === 0) {
                LocalStorage.clear()
                SceneChanger.goto(() => new SceneTitle())
            }

            return true
        })

        this.#pages.before("fullscreen", async (pages) => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                document.documentElement.requestFullscreen()
            }
            return true
        })
    }

    async #始まり() {
        LocalStorage.addFlag("始まり")

        const commands = await fetch("../../assets/stories/始まり.json").then((res) => res.json())
        await Serif.say(...commands)
    }

    #setupFirstPage() {
        const page = this.#pages.pages.get("first")!

        Awaits.ok().then(() => {
            // KeyboardOperation.update(page)
            page.classList.add("show")
        })

        // Serif.say("test")
    }
}
