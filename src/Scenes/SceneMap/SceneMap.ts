import { Dom } from "../../Dom.js"
import { LocalStorage } from "../../LocalStorage.js"
import { Awaits } from "../../utils/Awaits.js"
import { BGM } from "../../utils/BGM.js"
import { Graph } from "../../utils/Graph.js"
import { Pages } from "../../utils/Pages.js"
import { Serif } from "../../utils/Serif.js"
import { MapRenderer } from "./MapRenderer.js"
import { MapStoryHandler } from "./MapStoryHandler.js"
import { Scene } from "../Scene.js"
import { SceneChanger } from "../SceneChanger.js"
import { MapConfig } from "./MapConfig.js"

export class SceneMap extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    readonly #renderer: MapRenderer
    readonly #story: MapStoryHandler
    #currentCh: number
    #yuyuPosition = 0

    constructor(ch: 0 | 1 | 2) {
        super()
        this.#currentCh = ch
        this.#renderer = new MapRenderer(Dom.container)
        this.#story = new MapStoryHandler()
        this.ready = this.#setup()
    }

    async #setup() {
        await this.#pages.loadFromFile(Dom.container, "assets/pages/map.html", { history: ["ch" + this.#currentCh] })

        this.#pages.on("ch[012]", (pages) => {
            const id = pages.getCurrentPageId()
            this.#handleChapterChange(id)
        })

        this.#pages.before("back", async () => {
            const { SceneTitle } = await import("../SceneTitle.js")
            SceneChanger.goto(() => new SceneTitle())
            return true
        })

        const graphs = Dom.container.querySelectorAll<Graph>("x-graph")
        await Promise.all(Array.from(graphs).map((g) => g.ready))

        this.#refreshMap()
        this.#setupEvents()
        this.#renderer.moveYuyu(0)
    }

    #handleChapterChange(pageId: string) {
        if (pageId === "ch1") this.#story.playEvent("敵対", "ch1")
        if (pageId === "ch2") this.#story.playEvent("歪み", "ch2")
        this.#currentCh = parseInt(pageId.replace("ch", ""))
        this.#renderer.moveYuyu(MapConfig.STAGE_OFFSETS[this.#currentCh])
    }

    #refreshMap() {
        const stageData = LocalStorage.getStageData()
        this.#renderer.renderArrows(stageData)

        const graphs = Dom.container.querySelectorAll<Graph>("x-graph")
        graphs.forEach((graph, index) => {
            this.#renderer.renderChapter(graph, index, stageData, (id) => this.#onStageSelected(id))
        })
    }

    /**
     * ステージ選択時のフロー： ストーリー -> 確認 -> ゲーム開始 -> チュートリアル
     */
    async #onStageSelected(stageId: number) {
        // if (this.#yuyuPosition !== stageId) {
        //     this.#yuyuPosition = stageId
        //     this.#renderer.moveYuyu(stageId)
        //     return
        // }

        // 1. ストーリー再生
        await this.#story.playStageIntro(stageId)

        // 2. 意思確認
        const choice = await Serif.ask("やる?", ["はい", "いいえ"])
        if (choice !== 0) return

        // 3. ゲーム本編へ移動
        await this.#launchGame(stageId)
    }

    async #launchGame(stageId: number) {
        const { SceneGame } = await import("../SceneGame.js")
        BGM.ffp("assets/sounds/bgm/why_was_faith_lost.mp3", { loop: true, loopStartS: 1.276 })

        await SceneChanger.goto(() => new SceneGame(this.#currentCh as 0 | 1 | 2, stageId), {
            fadeOut: Awaits.valeOut,
            fadeIn: Awaits.valeIn,
            msOut: 850,
            msIn: 850,

            afterLoad: () => {
                // 4. チュートリアル再生
                this.#story.playTutorial(stageId)
            },
        })
    }

    #setupEvents() {
        // ...（省略：MapStoryHandlerのplayEventを使って整理可能）

        Dom.container.querySelectorAll<HTMLElement>(".event").forEach((el) => {
            el.addEventListener("click", () => {
                const eventName = el.dataset.eventName
                if (!eventName) throw new Error("イベント名が指定されていません")
                this.#story.playEvent(eventName)
            })
        })
    }
}
