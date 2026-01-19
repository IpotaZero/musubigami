import { Edge } from "./Edge"
import { EdgeData, SVG_NS, VertexData } from "./Graph"
import { Vertex } from "./Vertex"

export class Game {
    onClear = () => {}
    onMove = () => {}
    onSwitch = () => {}

    readonly svg: SVGSVGElement
    readonly pen = document.createElement("span")

    private penIndex: number = 0

    private vertices: Vertex[] = []
    private edges: Edge[] = []

    private firstClicked = false
    private resizeObserver

    constructor(width: number, height: number) {
        this.svg = createSVG(width, height)
        this.pen.classList.add("game-pen")

        this.resizeObserver = new ResizeObserver(this.#updatePenPosition.bind(this))
        this.resizeObserver.observe(document.body)
    }

    remove() {
        this.resizeObserver.unobserve(document.body)
    }

    // simple renderer: clear groups and recreate elements
    render({ vertices, edges }: { vertices: VertexData[]; edges: EdgeData[] }) {
        this.vertices = vertices.map((v, i) => new Vertex(v, i))
        this.edges = edges.map((e) => new Edge(vertices[e[0]], vertices[e[1]], e))

        this.#drawEdges()
        this.#drawVertices()

        this.vertices.forEach((vertex, index) => {
            vertex.svg.addEventListener("click", () => {
                this.#onClickVertex(index)
            })
        })

        this.#updateGraphics()
    }

    #drawEdges() {
        const edgesGroup = this.svg.querySelector("g.game-edges")!
        while (edgesGroup.firstChild) edgesGroup.removeChild(edgesGroup.firstChild)
        this.edges.forEach((e) => edgesGroup.appendChild(e.svg))
    }

    #drawVertices() {
        const verticesGroup = this.svg.querySelector("g.game-vertices")!
        while (verticesGroup.firstChild) verticesGroup.removeChild(verticesGroup.firstChild)
        this.vertices.forEach((v) => verticesGroup.appendChild(v.svg))
    }

    retry() {
        this.firstClicked = false
        this.penIndex = 0
        this.edges.forEach((e) => e.resetLeft())
        this.vertices.forEach((v) => v.resetLife())
        this.#updateGraphics()
    }

    #updateGraphics() {
        this.#updatePenPosition()
        this.#updateVertexColor()
    }

    #onClickVertex(index: number) {
        if (!this.firstClicked) {
            this.firstClicked = true
            this.#onMove(index)
            return
        }

        if (this.vertices[index].life <= 0) return

        //
        if (index === this.penIndex) return

        // 現在の頂点とクリックした頂点を結ぶ辺が残っているか
        const edgeIndex = this.#findEdgeIndex(index, this.penIndex)
        if (edgeIndex === -1) return

        // 辺の残数を減らす
        this.edges[edgeIndex].decrementLeft()

        this.#onMove(index)
    }

    #onMove(index: number) {
        this.onMove()

        this.vertices.forEach((v) => v.life--)

        if (this.vertices[index].switch) {
            this.edges.forEach((e) => e.toggleValid())
            this.onSwitch()
        }

        // ペンを移動
        this.penIndex = index
        this.#updateGraphics()

        if (this.edges.every((e) => e.left === 0)) {
            this.onClear()
        }
    }

    #updatePenPosition() {
        if (!this.firstClicked) {
            this.pen.style.left = `calc(100% - 15dvh)`
            this.pen.style.top = `calc(100% - 26dvh)`
            return
        }

        const penVertex = this.vertices[this.penIndex].svg
        const rect = penVertex.getBoundingClientRect()
        this.pen.style.left = `${rect.x + rect.width / 2}px`
        this.pen.style.top = `${rect.y + rect.height / 2}px`
    }

    #updateVertexColor() {
        if (!this.firstClicked) {
            this.vertices.forEach((v) => v.updateGraphic("active"))
            return
        }

        this.vertices.forEach((v, index) => {
            const isConnected = this.#findEdgeIndex(index, this.penIndex) !== -1

            v.updateGraphic(index === this.penIndex ? "current" : isConnected ? "active" : "normal")
        })
    }

    #findEdgeIndex(from: number, to: number) {
        return this.edges.findIndex((e) => e.matches(from, to))
    }
}

function createSVG(width: number, height: number) {
    // create SVG
    const svg = document.createElementNS(SVG_NS, "svg")
    svg.setAttribute("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
    svg.classList.add("game-svg")

    // groups for ordering: edges under vertices
    const edgesGroup = document.createElementNS(SVG_NS, "g")
    edgesGroup.classList.add("game-edges")
    svg.appendChild(edgesGroup)

    const verticesGroup = document.createElementNS(SVG_NS, "g")
    verticesGroup.classList.add("game-vertices")
    svg.appendChild(verticesGroup)

    svg.appendChild(createMarker(svg))

    return svg
}

function createMarker(svg: SVGSVGElement) {
    const marker = document.createElementNS(svg.namespaceURI, "marker")

    marker.id = "arrow-end"
    marker.setAttribute("orient", "auto")
    marker.setAttribute("markerWidth", "4")
    marker.setAttribute("markerHeight", "4")
    marker.setAttribute("refX", "6")
    marker.setAttribute("refY", "2")

    const path = document.createElementNS(svg.namespaceURI, "path")
    path.setAttribute(
        "d",
        `
        M 4 0
        Q 2 1.3, 0 2
        Q 2 2.7, 4 4
        Z
        `,
    )
    path.setAttribute("fill", "currentColor")
    marker.appendChild(path)

    return marker
}
