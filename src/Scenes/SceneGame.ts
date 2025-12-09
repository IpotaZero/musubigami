import { Dom } from "../Dom"
import { Edge, Game, Vertex } from "../Game"
import { LocalStorage } from "../LocalStorage"
import { Pages } from "../utils/Pages"
import { Serif, SerifCommand } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"

type Chapters = 0 | 1 | 2

export class SceneGame extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    readonly #game = new Game()

    constructor(ch: Chapters, stageId: number) {
        super()
        this.ready = this.#setup(ch, stageId)
    }

    override async end(): Promise<void> {
        this.#game.remove()
    }

    async #setup(ch: Chapters, stageId: number) {
        const html = await fetch("pages/game.html").then((res) => res.text())
        await this.#pages.load(Dom.container, html)

        this.#setupButtons(ch, stageId)
        this.#setupGame(ch, stageId)
    }

    #setupButtons(ch: Chapters, stageId: number) {
        this.#pages.before("back", async () => {
            const { SceneMap } = await import("./SceneMap")
            SceneChanger.goto(() => new SceneMap(ch))
        })

        this.#pages.before("next", async () => {
            const { SceneMap } = await import("./SceneMap")
            await SceneChanger.goto(() => new SceneMap(ch))

            const commands = await fetch(`../../assets/stories/end${stageId}.json`).then((res) => res.json())
            Serif.say(...commands)
        })

        this.#pages.before("retry", async () => {
            this.#game.retry()
            return true
        })
    }

    async #setupGame(ch: Chapters, stageId: number) {
        const container = this.#pages.pages.get("first")!

        const stageLabel = container.querySelector("#stage-id")!
        stageLabel.textContent = `Stage: ${ch}-${stageId}`

        const center = container.querySelector("#center")!
        center.appendChild(this.#game.svg)
        center.appendChild(this.#game.pen)

        // @ts-ignore
        const modules = import.meta.glob("../stages/*")
        const url = `../stages/Stage${stageId}.ts`
        const { stage } = await modules[url]()

        this.#game.render(stage())

        const followed = container.querySelector("#followed")

        this.#game.onClear = () => {
            LocalStorage.setStageData(stageId, { cleared: true })
            const nextButton = container.querySelector("[data-link=next]")!
            nextButton.classList.add("fade-in")
            followed?.classList.add("fade")
        }
    }
}
