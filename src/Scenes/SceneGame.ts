import { Dom } from "../Dom"
import { Game } from "../Game/Game"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM/BGM"
import { startConfetti } from "../utils/confetti"
import { MusicVisualizer } from "../utils/MusicVisualizer"
import { Pages } from "../utils/Pages/Pages"
import { Serif, SerifCommand } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"
import { MapConfig } from "./SceneMap/MapConfig"

type Chapters = 0 | 1 | 2

export class SceneGame extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    readonly #game = new Game(400, 300)

    private mvUpdate = true

    constructor(ch: Chapters, stageId: number) {
        super()
        this.ready = this.#setup(ch, stageId)
    }

    override async end(): Promise<void> {
        this.mvUpdate = false
        this.#game.remove()
    }

    async #setup(ch: Chapters, stageId: number) {
        const p = this.#startBGM(stageId)
        await this.#pages.loadFromFile(Dom.container, "assets/pages/game.html")

        this.#setupButtons(ch, stageId)
        this.#setupCanvas()
        await this.#setupGame(ch, stageId)
        await p

        if (stageId === 0) {
            this.#firstStageTutorial()
        }
    }

    async #startBGM(stageId: number) {
        if (stageId === MapConfig.BOSSES[0] || stageId === MapConfig.BOSSES[1] || stageId === MapConfig.BOSSES[2]) {
            await BGM.load("assets/sounds/bgm/まるでパズル感覚で.mp3")
            BGM.glance("assets/sounds/bgm/まるでパズル感覚で.mp3", {
                loop: true,
                loopStartS: 11.111,
                loopEndS: 82.222,
                volume: 0.8,
            })
        } else if (stageId === MapConfig.BOSSES[3]) {
            await BGM.load("assets/sounds/bgm/block.mp3")
            BGM.glance("assets/sounds/bgm/block.mp3", {
                loop: true,
                loopStartS: 13.333,
                loopEndS: 95,
                volume: 0.6,
            })
        } else {
            await BGM.load("assets/sounds/bgm/why_was_faith_lost.mp3")
            BGM.glance("assets/sounds/bgm/why_was_faith_lost.mp3", { loop: true, loopStartS: 1.276 })
        }
    }

    #setupButtons(ch: Chapters, stageId: number) {
        this.#pages.beforeEnter("back", async () => {
            BGM.back()
            SceneChanger.goto(() => import("./SceneMap/SceneMap.js").then(({ SceneMap }) => new SceneMap(ch)))
        })

        this.#pages.beforeEnter("next", async () => {
            if (stageId === MapConfig.BOSSES[3]) {
                await SceneChanger.goto(async () => import("./SceneEnd.js").then(({ SceneEnd }) => new SceneEnd()))
            } else {
                BGM.back()

                // @ts-ignore
                const commands = await import(`../../assets/stories/story.js`)
                await SceneChanger.goto(
                    () => import("./SceneMap/SceneMap.js").then(({ SceneMap }) => new SceneMap(ch)),
                    {
                        afterLoad: () => Serif.say(...commands.default[stageId].end),
                    },
                )
            }
        })

        this.#pages.beforeEnter("retry", async () => {
            this.#game.retry()
            SE.reset.play()
        })
    }

    async #setupGame(ch: Chapters, stageId: number) {
        const container = this.#pages.getPage("first")

        // if式欲しい......欲しくない?
        const s = (() => {
            if (stageId >= 13) {
                return stageId - 13
            }

            if (stageId >= 7) {
                return stageId - 7
            }

            return stageId
        })()

        const stageLabel = container.querySelector("#stage-id")!
        stageLabel.textContent = `Stage: ${ch}-${s}`

        const center = container.querySelector("#center")!
        center.appendChild(this.#game.svg)
        center.appendChild(this.#game.pen)

        // @ts-ignore
        const modules = import.meta.glob("../stages/*")
        const url = `../stages/Stage${stageId}.ts`
        const { stage } = await modules[url]()

        this.#game.render(stage())

        const followed = container.querySelector("#followed")!

        this.#game.onClear = () => {
            SE.clear.play()
            SE.kansei.play()
            LocalStorage.setStageData(stageId, { cleared: true })
            const nextButton = container.querySelector("[data-link=next]")!
            nextButton.classList.add("fade-in")
            followed.classList.remove("fade")
            requestAnimationFrame(() => {
                followed.classList.add("fade")
            })

            startConfetti(Dom.container, { durationMs: 2500 })
        }

        this.#game.onSwitch = () => {
            SE.switch.play()
        }

        this.#game.onMove = () => {
            SE.move.play()
        }
    }

    #setupCanvas() {
        const cvs = Dom.container.querySelector("canvas")!
        cvs.width = Dom.container.clientWidth * 0.9
        cvs.height = Dom.container.clientHeight
        const mv = new MusicVisualizer(cvs, BGM.gain, BGM.context)

        const loop = () => {
            mv.drawFrequency("rgba(212, 209, 168, 0.07)", cvs.width / 2, cvs.height / 2, cvs.height / 4, cvs.height)
            if (this.mvUpdate) requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }

    #firstStageTutorial() {
        const v = Dom.container.querySelector("rect")

        if (!v) throw new Error()

        const rect = v.getClientRects()?.[0]

        const arrow = document.createElement("span")
        arrow.classList.add("tutorial-arrow")
        arrow.style.top = `${rect.top}px`
        arrow.style.left = `${rect.left}px`

        Dom.container.appendChild(arrow)

        v.addEventListener(
            "click",
            () => {
                arrow.style.opacity = "0"
            },
            { once: true },
        )
    }
}
