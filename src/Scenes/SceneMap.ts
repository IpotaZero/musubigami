// SceneMap.ts
import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
import { Awaits } from "../utils/Awaits"
import { BGM } from "../utils/BGM"
import { Graph } from "../utils/Graph"
import { Pages } from "../utils/Pages"
import { PsdElement } from "../utils/PsdElement"
import { Serif } from "../utils/Serif"
import { Scene } from "./Scene"
import { SceneChanger } from "./SceneChanger"

export class SceneMap extends Scene {
    readonly ready: Promise<void>
    readonly #pages = new Pages()
    #currentCh: 0 | 1 | 2

    #intervalId!: number

    constructor(ch: 0 | 1 | 2) {
        super()
        this.#currentCh = ch
        this.ready = this.#setup()
    }

    async end(): Promise<void> {
        clearInterval(this.#intervalId)
    }

    async #setup() {
        const html = await fetch("pages/map.html").then((res) => res.text())
        await this.#pages.load(Dom.container, html, { history: ["ch" + this.#currentCh] })

        this.#pages.on("ch[012]", (pages) => {
            const id = pages.getCurrentPageId()

            switch (id) {
                case "ch0":
                    this.#currentCh = 0
                    break
                case "ch1":
                    this.#currentCh = 1
                    break
                case "ch2":
                    this.#currentCh = 2
                    break
            }
        })

        this.#initializeMapState()
        this.#setupBackButton()
    }

    /**
     * マップの状態（矢印、ステージボタン、星など）を初期化・描画する
     */
    #initializeMapState() {
        const stageData = LocalStorage.getStageData()

        // 1. チャプター遷移矢印の表示制御
        if (stageData[MapConfig.UNLOCK_ARROW_TRIGGERS.TO_CH1].cleared) {
            MapGraphView.showChapterArrow(Dom.container, 0)
        }
        if (stageData[MapConfig.UNLOCK_ARROW_TRIGGERS.TO_CH2].cleared) {
            MapGraphView.showChapterArrow(Dom.container, 1)
        }

        // 2. 各チャプター（グラフ）ごとのステージ描画制御
        const graphs = Dom.container.querySelectorAll<Graph>("x-graph")

        graphs.forEach((graph, chapterIndex) => {
            const svg = graph.querySelector("svg")!
            const stageButtons = svg.querySelectorAll<SVGRectElement>(".stage")

            // 最初のステージは常に表示
            MapGraphView.showStageButton(svg, 0)

            stageButtons.forEach((button, localStageIndex) => {
                const globalStageId = MapConfig.getGlobalStageId(chapterIndex, localStageIndex)
                const isCleared = stageData[globalStageId]?.cleared

                // クリア済みの場合の表示更新（星、エッジ、次のステージ解放）
                if (isCleared) {
                    MapGraphView.markupStar(svg, button)
                    MapGraphView.showEdges(svg, localStageIndex)
                    MapGraphView.showConnectedStages(graph, localStageIndex)
                }

                // クリックイベントの設定
                button.onclick = () => this.#onStageClick(globalStageId)
            })
        })
    }

    #setupBackButton() {
        this.#pages.before("back", async () => {
            const { SceneTitle } = await import("./SceneTitle.js")
            SceneChanger.goto(() => new SceneTitle())
            return true
        })
    }

    /**
     * ステージがクリックされた時の処理
     */
    async #onStageClick(stageId: number) {
        const commands = await fetch(`../../assets/stories/start.json`).then((r) => r.json())
        await Serif.say(...commands[stageId])

        const choice = await Serif.ask("やる?", ["やる", "やらない"])
        if (choice !== 0) return

        await this.#transitionToGame(stageId)

        switch (stageId) {
            case 0:
                await this.#playTutorial(0)
                break
            case 4:
                await this.#playTutorial(1)
                break
            case 5:
                await this.#playTutorial(2)
                break
        }
    }

    async #transitionToGame(stageId: number) {
        const { SceneGame } = await import("./SceneGame.js")

        BGM.ffp("assets/sounds/bgm/why_was_faith_lost.mp3", { loop: true, loopStartS: 1.276 })

        await SceneChanger.goto(() => new SceneGame(this.#currentCh, stageId), {
            fadeOut: Awaits.valeOut,
            fadeIn: Awaits.valeIn,
            msOut: 850,
            msIn: 850,
        })
    }

    async #playTutorial(index: number) {
        const commands = await fetch("../../assets/stories/tutorial.json").then((res) => res.json())
        await Serif.say(...commands[index])
    }
}

// MapConfig.ts
const MapConfig = {
    // 各チャプターの開始ステージIDオフセット
    STAGE_OFFSETS: [0, 7, 13],

    // 次のチャプターへの矢印を解放するトリガーステージID
    UNLOCK_ARROW_TRIGGERS: {
        TO_CH1: 6,
        TO_CH2: 12,
    },

    /** チャプターインデックスとローカルインデックスからグローバルなステージIDを計算 */
    getGlobalStageId(chapterIndex: number, localStageIndex: number): number {
        return localStageIndex + (this.STAGE_OFFSETS[chapterIndex] || 0)
    },
}

// MapGraphView.ts
class MapGraphView {
    /**
     * SVG内の特定のステージにクリア済みの星マークを追加する
     */
    static markupStar(svg: SVGSVGElement, button: SVGRectElement) {
        const x = Number(button.getAttribute("x"))
        const y = Number(button.getAttribute("y"))

        const img = document.createElementNS("http://www.w3.org/2000/svg", "image")
        img.classList.add("star-icon")
        img.setAttribute("href", "assets/images/star.png")
        img.setAttribute("x", String(x - 12))
        img.setAttribute("y", String(y - 12))
        img.setAttribute("width", "24")
        img.setAttribute("height", "24")

        svg.appendChild(img)
    }

    /**
     * 指定したステージIDに関連するエッジ（道）を表示する
     */
    static showEdges(svg: SVGSVGElement, localStageIndex: number) {
        svg.querySelectorAll(`.path[data-from="${localStageIndex}"], .path[data-to="${localStageIndex}"]`).forEach(
            (edge) => edge.classList.remove("hidden"),
        )
    }

    /**
     * ステージボタンを表示状態にする
     */
    static showStageButton(svg: SVGSVGElement, localStageIndex: number) {
        svg.querySelectorAll<SVGRectElement>(".stage")[localStageIndex]?.classList.remove("hidden")
    }

    /**
     * 接続されている次のステージ群を表示する
     */
    static showConnectedStages(graph: Graph, localStageIndex: number) {
        graph.getConnectedVertices(localStageIndex).forEach((stage) => stage.classList.remove("hidden"))
    }

    /**
     * チャプター遷移用の矢印を表示する
     */
    static showChapterArrow(container: HTMLElement, arrowIndex: number) {
        container.querySelectorAll(".map-arrow-right")[arrowIndex]?.classList.remove("hidden")
    }
}
