import { Dom } from "../Dom"
import { Game } from "../Game/Game"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM/BGM"
import { MusicVisualizer } from "../utils/MusicVisualizer"
import { Pages } from "../utils/Pages"
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
        await this.#pages.loadFromFile(Dom.container, "assets/pages/game.html")

        this.#setupButtons(ch, stageId)
        this.#setupCanvas()
        await this.#setupGame(ch, stageId)

        if (stageId === 0) {
            this.#firstStageTutorial()
        }
    }

    #setupButtons(ch: Chapters, stageId: number) {
        this.#pages.before("back", async () => {
            const { SceneMap } = await import("./SceneMap/SceneMap.js")
            SceneChanger.goto(() => new SceneMap(ch))
        })

        this.#pages.before("next", async () => {
            if (stageId === MapConfig.BOSSES[3]) {
                const { SceneEnd } = await import("./SceneEnd.js")
                await SceneChanger.goto(() => new SceneEnd())
            } else {
                const { SceneMap } = await import("./SceneMap/SceneMap.js")
                // @ts-ignore
                const commands = await import(`../../assets/stories/story.js`)
                await SceneChanger.goto(() => new SceneMap(ch), {
                    afterLoad: () => Serif.say(...commands.default[stageId].end),
                })
            }
        })

        this.#pages.before("retry", async () => {
            this.#game.retry()
            SE.reset.play()
            return true
        })
    }

    async #setupGame(ch: Chapters, stageId: number) {
        const container = this.#pages.pages.get("first")!

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
            LocalStorage.setStageData(stageId, { cleared: true })
            const nextButton = container.querySelector("[data-link=next]")!
            nextButton.classList.add("fade-in")
            followed.classList.remove("fade")
            requestAnimationFrame(() => {
                followed.classList.add("fade")
            })
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
