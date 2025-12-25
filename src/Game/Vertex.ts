import { SVG_NS, VertexData } from "./Graph"

export class Vertex {
    svg: SVGGElement

    switch: boolean
    life: number
    readonly baseLife: number

    private rect: SVGRectElement
    private text: SVGTextElement

    private index: number

    constructor(v: VertexData, index: number) {
        this.index = index

        this.svg = document.createElementNS(SVG_NS, "g")
        this.rect = createVertex(v)
        this.text = createText(v)

        this.svg.appendChild(this.rect)
        this.svg.appendChild(this.text)

        this.switch = v[2]?.switch ?? false
        this.baseLife = v[2]?.life ?? Infinity
        this.life = this.baseLife
    }

    resetLife() {
        this.life = this.baseLife
    }

    updateGraphic(mode: "normal" | "active" | "current") {
        this.rect.dataset.mode = this.life > 0 ? mode : "no-available"
        this.rect.dataset.switch = String(this.switch)

        this.text.innerHTML = Number.isFinite(this.life) ? String(Math.max(this.life, 0)) : ""
        // this.text.innerHTML = this.index + (Number.isFinite(this.life) ? String(Math.max(this.life, 0)) : "")
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

function createText(v: VertexData) {
    const size = 48 // 正方形の一辺

    const text = document.createElementNS(SVG_NS, "text")
    text.classList.add("game-text")

    text.setAttribute("x", String(v[0] - size / 2))
    text.setAttribute("y", String(v[1] - size / 8))

    return text
}
