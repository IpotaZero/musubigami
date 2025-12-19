import { Dom } from "../Dom"
import { Edge, Game, Vertex } from "../Game"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM"
import { MusicVisualizer } from "../utils/MusicVisualizer"
import { Pages } from "../utils/Pages"
import { Serif, SerifCommand } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"

type Chapters = 0 | 1 | 2

export class SceneGame extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    readonly #game = new Game()

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
        const html = await fetch("pages/game.html").then((res) => res.text())
        await this.#pages.load(Dom.container, html)

        this.#setupButtons(ch, stageId)
        this.#setupGame(ch, stageId)
        this.#setupCanvas()
    }

    #setupButtons(ch: Chapters, stageId: number) {
        this.#pages.before("back", async () => {
            const { SceneMap } = await import("./SceneMap.js")
            SceneChanger.goto(() => new SceneMap(ch))
        })

        this.#pages.before("next", async () => {
            const { SceneMap } = await import("./SceneMap.js")
            await SceneChanger.goto(() => new SceneMap(ch))

            const commands = await fetch(`../../assets/stories/end.json`).then((res) => res.json())
            Serif.say(...commands[stageId])
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

        this.#game.onMove = () => {
            SE.move.play()
        }
    }

    #setupCanvas() {
        const cvs = Dom.container.querySelector("canvas")!
        cvs.width = Dom.container.clientWidth
        cvs.height = Dom.container.clientHeight
        const mv = new MusicVisualizer(cvs, BGM.wholeGain, BGM.context)

        const loop = () => {
            mv.drawFrequency("rgba(212, 209, 168, 0.07)", cvs.width / 2, cvs.height / 2, cvs.height / 4, cvs.height)
            if (this.mvUpdate) requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }
}
