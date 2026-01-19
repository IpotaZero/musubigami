import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { Awaits } from "../utils/Awaits"
import { BGM } from "../utils/BGM/BGM"
import { KeyboardOperation } from "../utils/KeyboardOperation"
import { Pages } from "../utils/Pages/Pages"
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
        await this.#pages.loadFromFile(Dom.container, "assets/pages/title.html")

        this.#setupFirstPage()
        this.#setupVolumeSetting()
        this.#setupButtonSE()
        this.#setupButton()
        this.#showWomake()
    }

    #setupButton() {
        // this.#pages.on(".*", (pages) => {
        //     KeyboardOperation.update(pages.getCurrentPage())
        // })

        this.#pages.beforeEnter("start", async (pages) => {
            SE.suzu.play()

            BGM.pause()
            BGM.unload("assets/sounds/bgm/信仰の残り香.mp3")
            BGM.change("assets/sounds/bgm/仲介行脚.mp3", { loop: true, loopEndS: 118.125 })

            if (!LocalStorage.getFlags().includes("始まり")) {
                await SceneChanger.goto(
                    () => import("./SceneMap/SceneMap.js").then(({ SceneMap }) => new SceneMap(0)),
                    {
                        msIn: 1800,
                        msOut: 1800,
                        afterLoad: async () => {
                            this.#始まり()
                        },
                    },
                )
            } else {
                await SceneChanger.goto(() => import("./SceneMap/SceneMap.js").then(({ SceneMap }) => new SceneMap(0)))
            }
        })

        this.#pages.beforeEnter("delete-data", async () => {
            const choice = await Serif.ask("ほんとに?", ["はい", "いいえ"])

            if (choice === 0) {
                LocalStorage.clear()
                SceneChanger.goto(async () => new SceneTitle())
            }
        })

        this.#pages.beforeEnter("fullscreen", (pages) => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                document.documentElement.requestFullscreen()
            }
        })
    }

    async #始まり() {
        LocalStorage.addFlag("始まり")

        // @ts-ignore
        const commands = await import("../../assets/stories/event.js")
        await Serif.say(...commands.default["始まり"])
    }

    #setupFirstPage() {
        const page = this.#pages.getPage("first")

        BGM.fadeOut()

        Awaits.ok().then(() => {
            page.classList.add("show")
            BGM.change("assets/sounds/bgm/信仰の残り香.mp3")
            this.#setupParticles()
            // requestAnimationFrame(() => {
            //     KeyboardOperation.update(page)
            // })
        })

        // Serif.say("test")
    }

    #setupVolumeSetting() {
        const page = this.#pages.getPage("setting")

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
        // Dom.container.querySelectorAll("button").forEach((button) => {
        //     button.addEventListener("click", () => {
        //         SE.click.play()
        //     })
        // })
    }

    #setupParticles() {
        const page = Dom.container

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement("div")
            particle.classList.add("particle")
            particle.style.left = `${Math.random() * 100}%`
            particle.style.width = `${20 + Math.random() * 30}px`
            particle.style.height = particle.style.width
            particle.style.animationDuration = `${5 + Math.random() * 5}s`
            particle.style.animationDelay = `${Math.random() * 10}s`
            page.appendChild(particle)
        }
    }

    #showWomake() {
        if (LocalStorage.getStageData().every((stage) => stage.cleared)) {
            Dom.container.querySelector("[data-link=story]")?.classList.remove("hidden")
        }
    }
}
