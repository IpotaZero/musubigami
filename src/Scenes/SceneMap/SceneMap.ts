import { Dom } from "../../Dom.js"
import { LocalStorage } from "../../LocalStorage.js"
import { Awaits } from "../../utils/Awaits.js"
import { BGM } from "../../utils/BGM/BGM.js"
import { Graph } from "../../utils/Graph.js"
import { Pages } from "../../utils/Pages/Pages.js"
import { Serif } from "../../utils/Serif.js"
import { MapRenderer } from "./MapRenderer.js"
import { MapStoryHandler } from "./MapStoryHandler.js"
import { Scene } from "../Scene.js"
import { SceneChanger } from "../SceneChanger.js"
import { MapConfig } from "./MapConfig.js"
import { KeyboardOperation } from "../../utils/KeyboardOperation.js"
import { Transition } from "../../utils/Transition.js"

export class SceneMap extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    readonly #renderer: MapRenderer
    readonly #story: MapStoryHandler
    #currentCh: 0 | 1 | 2
    #yuyuPosition = 0

    constructor(ch: 0 | 1 | 2) {
        super()
        this.#currentCh = ch
        this.#renderer = new MapRenderer(Dom.container)
        this.#story = new MapStoryHandler()
        this.ready = this.#setup()

        // KeyboardOperation.update(null)
    }

    async #setup() {
        await this.#pages.loadFromFile(Dom.container, "assets/pages/map.html", { history: ["ch" + this.#currentCh] })

        this.#pages.onEnter("ch[012]", (pages) => {
            const id = pages.getCurrentPageId()
            this.#handleChapterChange(id)
        })

        this.#pages.beforeEnter("back", async () => {
            SceneChanger.goto(() => import("../SceneTitle.js").then(({ SceneTitle }) => new SceneTitle()))
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
        this.#currentCh = parseInt(pageId.replace("ch", "")) as 0 | 1 | 2
        // this.#renderer.moveYuyu(MapConfig.STAGE_OFFSETS[this.#currentCh])
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
        const choice = await Serif.ask("", ["やらない", "やる"])
        if (choice !== 1) return

        // 3. ゲーム本編へ移動
        await this.#launchGame(stageId)
    }

    async #launchGame(stageId: number) {
        const ms = 600

        await SceneChanger.goto(
            () => import("../SceneGame.js").then(({ SceneGame }) => new SceneGame(this.#currentCh, stageId)),
            {
                fadeOut: Transition.valeOut,
                fadeIn: Transition.valeIn,
                msOut: ms,
                msIn: ms,

                afterLoad: () => {
                    // 4. チュートリアル再生
                    this.#story.playTutorial(stageId)
                },
            },
        )
    }

    #setupEvents() {
        Dom.container.querySelectorAll<HTMLElement>(".event").forEach((el) => {
            el.addEventListener("click", async () => {
                const eventName = el.dataset.eventName
                if (!eventName) throw new Error("イベント名が指定されていません")

                const ps = []

                if (el.dataset.bgm) {
                    ps.push(BGM.glance(el.dataset.bgm))
                }

                ps.push(this.#story.playEvent(eventName))

                await Promise.all(ps)

                if (el.dataset.bgm) {
                    BGM.back()
                }
            })
        })
    }
}
