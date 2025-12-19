import { SVG_NS, VertexData } from "./Graph"

export class Vertex {
    svg: SVGRectElement

    constructor(v: VertexData) {
        this.svg = createVertex(v)
    }

    updateGraphic(mode: "normal" | "active" | "current") {
        this.svg.dataset.mode = mode
    }
}

function createVertex(v: VertexData) {
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
