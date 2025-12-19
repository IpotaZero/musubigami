import { VertexData, EdgeData, SVG_NS } from "./Graph"

export class Edge {
    svg: SVGPolygonElement

    left: number

    readonly from: number
    readonly to: number
    readonly baseLeft: number
    readonly arrow: boolean

    constructor(a: VertexData, b: VertexData, e: EdgeData) {
        this.svg = createEdge(a, b, e)

        this.from = e[0]
        this.to = e[1]

        this.baseLeft = e[2]?.multiplicity ?? 1
        this.left = this.baseLeft

        this.arrow = e[2]?.arrow ?? false

        this.updateGraphic()
    }

    matches(from: number, to: number) {
        const i = this.left > 0 && this.from === from && this.to === to

        if (this.arrow) {
            return i
        } else {
            return i || (this.left > 0 && this.from === to && this.to === from)
        }
    }

    decrementLeft() {
        this.left--
        this.updateGraphic()
    }

    private updateGraphic() {
        this.svg.dataset.left = String(this.left)
    }

    resetLeft() {
        this.left = this.baseLeft
        this.updateGraphic()
    }
}

function createEdge(a: VertexData, b: VertexData, e: EdgeData) {
    const line = document.createElementNS(SVG_NS, "polyline")

    line.setAttribute("points", `${a[0]},${a[1]} ${(a[0] + b[0]) / 2},${(a[1] + b[1]) / 2} ${b[0]},${b[1]}`)
    line.setAttribute("stroke", "currentColor")
    line.setAttribute("stroke-width", "3")
    line.setAttribute("stroke-linecap", "round")
    line.setAttribute("data-from", String(e[0]))
    line.setAttribute("data-to", String(e[1]))
    line.classList.add("edge")

    if (e[2]?.arrow) {
        line.setAttribute("marker-mid", "url(#arrow-end)")
    }

    return line
}
