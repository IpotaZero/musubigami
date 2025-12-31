import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { Awaits } from "../utils/Awaits"
import { BGM } from "../utils/BGM"
import { KeyboardOperation } from "../utils/KeyboardOperation"
import { Pages } from "../utils/Pages"
import { PsdElement } from "../utils/PsdElement"
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
        const html = await fetch("assets/pages/title.html").then((res) => res.text())
        await this.#pages.load(Dom.container, html)

        this.#setupFirstPage()
        this.#setupVolumeSetting()
        this.#setupButtonSE()

        // this.#pages.on(".*", (pages) => {
        //     const page = pages.pages.get(pages.getCurrentPageId())
        //     if (!page) return
        //     // KeyboardOperation.update(page)
        // })

        this.#pages.before("start", async (pages) => {
            const { SceneMap } = await import("./SceneMap.js")
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

        const commands = await fetch("../../assets/stories/event.json").then((res) => res.json())
        await Serif.say(...commands["始まり"])
    }

    #setupFirstPage() {
        const page = this.#pages.pages.get("first")!

        Awaits.ok().then(() => {
            // KeyboardOperation.update(page)
            page.classList.add("show")
        })

        // Serif.say("test")
    }

    #setupVolumeSetting() {
        const page = this.#pages.pages.get("setting")!

        const bgmV = page.querySelector<HTMLInputElement>("#bgm-volume")!
        const seV = page.querySelector<HTMLInputElement>("#se-volume")!

        bgmV.value = String(LocalStorage.getBGMVolume())
        seV.value = String(LocalStorage.getSEVolume())
        BGM.setVolume(LocalStorage.getBGMVolume() / 9)
        SE.setVolume(LocalStorage.getSEVolume() / 9)

        bgmV.oninput = () => {
            LocalStorage.setBGMVolume(+bgmV.value)
            BGM.setVolume(LocalStorage.getBGMVolume() / 9)
        }
        seV.oninput = () => {
            LocalStorage.setSEVolume(+seV.value)
            SE.setVolume(LocalStorage.getSEVolume() / 9)
            SE.move.play()
        }
    }

    #setupButtonSE() {
        Dom.container.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                SE.click.play()
            })
        })
    }
}
