import { Layer } from "ag-psd"

export class PsdRenderer {
    private baseWidth = 0
    private baseHeight = 0

    constructor(private container: HTMLElement) {}

    setBaseSize(width: number, height: number) {
        this.baseWidth = width
        this.baseHeight = height
    }

    appendCanvas(layer: Layer): void {
        // layerがフォルダの場合
        if (layer.children) {
            layer.children.forEach((layer) => this.appendCanvas(layer))
            return
        }

        if (!layer.canvas) {
            layer.canvas = PsdRenderer.createCanvas(layer.imageData as ImageData)
            layer.canvas.dataset["baseLeft"] = String(layer.left)
            layer.canvas.dataset["baseTop"] = String(layer.top)
            layer.canvas.classList.add("psd-canvas")
        }

        this.container.appendChild(layer.canvas)
    }

    updateScale(parentWidth: number, parentHeight: number, { mode = "contain" }: { mode: "cover" | "contain" }): void {
        if (!this.baseWidth || !this.baseHeight) return

        const scaleX = parentWidth / this.baseWidth
        const scaleY = parentHeight / this.baseHeight
        const scale = mode === "contain" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY)

        this.container.style.width = `${this.baseWidth * scale}px`
        this.container.style.height = `${this.baseHeight * scale}px`

        this.container.querySelectorAll("canvas").forEach((c) => {
            c.style.left = `${Number(c.dataset["baseLeft"]) * scale}px`
            c.style.top = `${Number(c.dataset["baseTop"]) * scale}px`
            c.style.width = `${c.width * scale}px`
            c.style.height = `${c.height * scale}px`
        })
    }

    private static createCanvas(imageData: ImageData): HTMLCanvasElement {
        const canvas = document.createElement("canvas")
        canvas.width = imageData.width
        canvas.height = imageData.height

        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Failed to get 2D context")

        ctx.putImageData(imageData, 0, 0)
        return canvas
    }
}
