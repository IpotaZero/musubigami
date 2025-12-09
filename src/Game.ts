export type Vertex = [x: number, y: number]
export type Edge = [from: number, to: number, multiplicity?: number, arrow?: boolean]

const SVG_NS = "http://www.w3.org/2000/svg"

export class Game {
    onClear = () => {}

    readonly svg: SVGSVGElement

    readonly pen = document.createElement("span")
    #penIndex: number = 0

    #vertexElements: SVGRectElement[] = []
    #edgeElements: SVGPolylineElement[] = []

    #edges: Edge[] = []
    #leftEdges: number[] = []

    #abortController = new AbortController()

    #firstClicked = false

    constructor(width = 400, height = 300) {
        // create SVG
        this.svg = document.createElementNS(SVG_NS, "svg")
        // this.svg.setAttribute("width", String(width))
        // this.svg.setAttribute("height", String(height))
        this.svg.setAttribute("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        this.svg.style.display = "block"
        this.svg.classList.add("game-svg")

        // groups for ordering: edges under vertices
        const edgesGroup = document.createElementNS(SVG_NS, "g")
        edgesGroup.setAttribute("class", "edges")
        this.svg.appendChild(edgesGroup)

        const vertsGroup = document.createElementNS(SVG_NS, "g")
        vertsGroup.setAttribute("class", "vertices")
        this.svg.appendChild(vertsGroup)

        this.pen.classList.add("game-pen")

        this.svg.appendChild(Game.#createMarker(this.svg))

        window.addEventListener(
            "resize",
            () => {
                this.#updatePenPosition()
            },
            { signal: this.#abortController.signal },
        )
    }

    remove() {
        this.#abortController.abort()
    }

    // simple renderer: clear groups and recreate elements
    render({ vertices, edges }: { vertices: Vertex[]; edges: Edge[] }) {
        this.#edges = edges

        // remove existing children of groups
        const edgesGroup = this.svg.querySelector("g.edges")!
        const vertsGroup = this.svg.querySelector("g.vertices")!
        while (edgesGroup.firstChild) edgesGroup.removeChild(edgesGroup.firstChild)
        while (vertsGroup.firstChild) vertsGroup.removeChild(vertsGroup.firstChild)

        // draw edges (lines)
        for (const e of edges) {
            const a = vertices[e[0]]
            const b = vertices[e[1]]
            if (!a || !b) continue

            const edge = this.#createEdge(a, b, e)
            edgesGroup.appendChild(edge)
            this.#edgeElements.push(edge)
        }

        // draw vertices (circles)
        for (const v of vertices) {
            const vertex = this.#createVertex(v)
            vertsGroup.appendChild(vertex)
            this.#vertexElements.push(vertex)
        }

        this.#vertexElements.forEach((vertex, index) => {
            vertex.addEventListener("click", () => {
                this.#onClickVertex(index)
            })
        })

        this.#leftEdges = edges.map((e) => e[2] ?? 1)

        this.#updateGraphics()
    }

    retry() {
        this.#firstClicked = false
        this.#penIndex = 0
        this.#leftEdges = this.#edges.map((e) => e[2] ?? 1)
        this.#updateGraphics()
    }

    #updateGraphics() {
        this.#updateEdgeColor()
        this.#updatePenPosition()
        this.#updateVertexColor()
    }

    #onClickVertex(index: number) {
        if (!this.#firstClicked) {
            this.#penIndex = index
            this.#firstClicked = true
            this.#updateGraphics()
            return
        }

        if (index === this.#penIndex) return

        // 現在の頂点とクリックした頂点を結ぶ辺が残っているか
        const edgeIndex = this.#edges.findIndex((e, i) => {
            // 通られているか?
            if (this.#leftEdges[i] === 0) return false

            // 一方通行の場合
            if (e[3]) {
                return e[1] === this.#penIndex && e[0] === index
            }

            return (e[0] === this.#penIndex && e[1] === index) || (e[1] === this.#penIndex && e[0] === index)
        })

        if (edgeIndex === -1) return

        // 辺の残数を減らす
        this.#leftEdges[edgeIndex]--

        // ペンを移動
        this.#penIndex = index

        this.#updateGraphics()

        if (this.#leftEdges.every((n) => n === 0)) {
            this.onClear()
        }
    }

    #updatePenPosition() {
        if (!this.#firstClicked) {
            this.pen.style.left = `calc(100% - 13dvh)`
            this.pen.style.top = `calc(100% - 13dvh)`
            return
        }

        const penVertex = this.#vertexElements[this.#penIndex]
        const rect = penVertex.getBoundingClientRect()
        this.pen.style.left = `${rect.x + rect.width / 2}px`
        this.pen.style.top = `${rect.y + rect.height / 2}px`
    }

    #updateVertexColor() {
        if (!this.#firstClicked) {
            this.#vertexElements.forEach((rect) => (rect.dataset.active = "true"))
            return
        }

        this.#vertexElements.forEach((rect, index) => {
            const isConnected = this.#edges.some((e, i) => {
                if (index === this.#penIndex) return false
                if (this.#leftEdges[i] === 0) return false

                if (e[3]) {
                    return e[1] === this.#penIndex && e[0] === index
                }

                return (e[0] === this.#penIndex && e[1] === index) || (e[1] === this.#penIndex && e[0] === index)
            })

            rect.dataset.active = String(isConnected)

            rect.dataset.current = String(index === this.#penIndex)
        })
    }

    #updateEdgeColor() {
        this.#edgeElements.forEach((line, index) => {
            line.dataset.left = String(this.#leftEdges[index])
        })
    }

    #createEdge(a: Vertex, b: Vertex, e: Edge) {
        const line = document.createElementNS(SVG_NS, "polyline")

        line.setAttribute("points", `${a[0]},${a[1]} ${(a[0] + b[0]) / 2},${(a[1] + b[1]) / 2} ${b[0]},${b[1]}`)
        line.setAttribute("stroke", "currentColor")
        line.setAttribute("stroke-width", "3")
        line.setAttribute("stroke-linecap", "round")
        line.setAttribute("data-from", String(e[0]))
        line.setAttribute("data-to", String(e[1]))
        line.classList.add("edge")

        if (e[3]) {
            line.setAttribute("marker-mid", "url(#arrow-end)")
        }

        return line
    }

    #createVertex(v: Vertex) {
        const size = 48 // 正方形の一辺
        const rect = document.createElementNS(SVG_NS, "rect")
        rect.setAttribute("width", String(size))
        rect.setAttribute("height", String(size))
        rect.setAttribute("x", String(v[0] - size / 2))
        rect.setAttribute("y", String(v[1] - size / 2))
        rect.setAttribute("fill", "#f5f5f5")
        rect.setAttribute("stroke", "#111")
        rect.setAttribute("stroke-width", "0.5")
        rect.classList.add("vertex")

        return rect
    }

    static #createMarker(svg: SVGSVGElement) {
        const marker = document.createElementNS(svg.namespaceURI, "marker")

        marker.id = "arrow-end"
        marker.setAttribute("orient", "auto")
        marker.setAttribute("markerWidth", "4")
        marker.setAttribute("markerHeight", "4")
        marker.setAttribute("refX", "8")
        marker.setAttribute("refY", "2")

        const path = document.createElementNS(svg.namespaceURI, "path")
        path.setAttribute(
            "d",
            `M 4 0
             Q 2 1.3, 0 2
             Q 2 2.7, 4 4
             Z`,
        )
        path.setAttribute("fill", "currentColor")
        marker.appendChild(path)

        return marker
    }
}
