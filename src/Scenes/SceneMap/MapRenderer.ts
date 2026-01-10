import { Graph } from "../../utils/Graph"
import { MapConfig } from "./MapConfig"

export class MapRenderer {
    constructor(private container: HTMLElement) {}

    moveYuyu(globalStageId: number) {
        const yuyu = this.container.querySelector<HTMLElement>("#yuyu")
        if (!yuyu) return

        const rect = this.container.querySelectorAll<SVGRectElement>(`.stage`)[globalStageId]?.getClientRects()[0]
        if (!rect) return

        yuyu.style.left = `${rect.left - rect.width / 4}px`
        yuyu.style.top = `${rect.top - rect.height / 4}px`
    }

    /** チャプター遷移矢印の更新 */
    renderArrows(stageData: any) {
        if (stageData[MapConfig.UNLOCK_ARROW_TRIGGERS.TO_CH1]?.cleared) {
            this.container.querySelectorAll(".map-arrow-right")[0]?.classList.remove("hidden")
        }
        if (stageData[MapConfig.UNLOCK_ARROW_TRIGGERS.TO_CH2]?.cleared) {
            this.container.querySelectorAll(".map-arrow-right")[1]?.classList.remove("hidden")
        }
    }

    /** 指定したグラフ（チャプター）内のステージ描画 */
    renderChapter(graph: Graph, chapterIndex: number, stageData: any, onClick: (id: number) => void) {
        const svg = graph.querySelector("svg")!
        const stageButtons = svg.querySelectorAll<SVGRectElement>(".stage")

        // 最初のステージは常に表示
        stageButtons[0]?.classList.remove("hidden")

        stageButtons.forEach((button, localIndex) => {
            const globalId = MapConfig.getGlobalStageId(chapterIndex, localIndex)
            const isCleared = stageData[globalId]?.cleared

            if (isCleared) {
                this.#drawStar(svg, button)
                this.#drawPath(svg, localIndex)
                this.#unlockNextStages(graph, localIndex)
            }
            button.onclick = () => onClick(globalId)
        })
    }

    #drawStar(svg: SVGSVGElement, button: SVGRectElement) {
        if (button.dataset.hasStar) return
        button.dataset.hasStar = "true"

        const x = Number(button.getAttribute("x"))
        const y = Number(button.getAttribute("y"))
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image")
        img.setAttribute("href", "assets/images/star.png")
        img.setAttribute("x", String(x - 12))
        img.setAttribute("y", String(y - 12))
        img.setAttribute("width", "24")
        img.setAttribute("height", "24")
        img.classList.add("star-icon")
        svg.appendChild(img)
    }

    #drawPath(svg: SVGSVGElement, index: number) {
        svg.querySelectorAll(`.path[data-from="${index}"], .path[data-to="${index}"]`).forEach((edge) =>
            edge.classList.remove("hidden"),
        )
    }

    #unlockNextStages(graph: Graph, index: number) {
        graph.getConnectedVertices(index).forEach((stage) => stage.classList.remove("hidden"))
    }
}
