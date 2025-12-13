import { readPsd, Psd, Layer } from "ag-psd"

type PsdElementOptions = Partial<{ url: string; layers: string }>

class PsdElement extends HTMLElement {
    static readonly observedAttributes = ["src", "layers"] as const
    private resizeObserver: ResizeObserver

    private psd: Psd | null = null
    private shadow: ShadowRoot
    private container: HTMLDivElement = document.createElement("div")

    private baseWidth = 0
    private baseHeight = 0

    constructor(options: PsdElementOptions = {}) {
        super()
        this.#setupAttribute(options)

        this.container.classList.add("container")
        this.shadow = this.attachShadow({ mode: "closed" })

        // --- Default CSS injection ---
        const style = document.createElement("style")
        style.textContent = `
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .container {
                position: relative;     /* レイヤーの基準座標 */
                transform-origin: center;
            }

            .psd-canvas {
                position: absolute;     /* 全レイヤーが同一原点に重なる */
                image-rendering: pixelated;
                animation: fade-in 0.1s linear; 
            }

            @keyframes fade-in {
                from {
                    opacity: 0.5;
                }

                to {
                    opacity: 1;
                }
            }
        `
        this.shadow.appendChild(style)
        this.shadow.appendChild(this.container)

        this.resizeObserver = new ResizeObserver(() => {
            this.updateScale()
        })
        this.resizeObserver.observe(this)
    }

    #setupAttribute(options: PsdElementOptions) {
        if (options.url) {
            this.setAttribute("src", options.url)
        }

        if (options.layers) {
            this.setAttribute("layers", options.layers)
        }
    }

    set layers(layers: string) {
        this.setAttribute("layers", layers)
    }

    get layers() {
        return this.getAttribute("layers") ?? ""
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (oldValue === newValue) return

        if (name === "src" && newValue) {
            void this.loadPsd(newValue)
        } else if (name === "layers") {
            this.renderLayers()
        }
    }

    private async loadPsd(url: string): Promise<void> {
        // this.renderLoading()
        this.psd = null

        try {
            const buffer = await this.fetchPsdData(url)
            this.psd = readPsd(buffer, { useImageData: true })

            this.baseWidth = this.psd.width ?? 0
            this.baseHeight = this.psd.height ?? 0
            this.container.style.width = `${this.baseWidth}px`
            this.container.style.height = `${this.baseHeight}px`

            this.renderLayers()
        } catch (error) {
            this.renderError(error)
        }
    }

    private async fetchPsdData(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.arrayBuffer()
    }

    private renderLayers(): void {
        if (!this.psd || !this.psd.children) return

        const layersAttr = this.getAttribute("layers")
        if (!layersAttr) {
            this.container.innerHTML += '<p>Please specify a "layers" attribute.</p>'
            return
        }

        this.clearContent()

        const layerNames = layersAttr.split(",").map((name) => name.trim())

        for (const name of layerNames) {
            const layer = PsdElement.findLayerByName(this.psd!.children!, name)

            if (!layer) {
                console.error(`PsdElement: layer-name ${name} is not found.`)
                console.error(
                    `layers:`,
                    this.psd?.children?.map((c) => c.name),
                )
                break
            }

            this.appendLayerCanvas(layer)
        }

        this.updateScale()
    }

    private appendLayerCanvas(layer: Layer): void {
        // layerがフォルダの場合
        if (layer.children) {
            for (const l of layer.children) {
                this.appendLayerCanvas(l)
            }
            return
        }

        if (!layer.canvas) {
            layer.canvas = PsdElement.createCanvas(layer.imageData as ImageData)
            layer.canvas.style.left = `${layer.left}px`
            layer.canvas.style.top = `${layer.top}px`
            layer.canvas.classList.add("psd-canvas")
        }

        this.container.appendChild(layer.canvas)
    }

    private renderLoading(): void {
        this.clearContent()
        this.container.innerHTML += "<p>Loading PSD...</p>"
    }

    private renderError(error: unknown): void {
        this.clearContent()
        const message = error instanceof Error ? error.message : "Unknown error"
        this.container.innerHTML += `<p style="color:red">Error: ${message}</p>`
    }

    private clearContent(): void {
        this.container.innerHTML = ""
    }

    private updateScale(): void {
        if (!this.baseWidth || !this.baseHeight) return

        const scaleX = this.clientWidth / this.baseWidth
        const scaleY = this.clientHeight / this.baseHeight
        const scale = Math.min(scaleX, scaleY)

        this.container.style.transform = `scale(${scale})`
    }

    private static findLayerByName(layers: Layer[], name: string): Layer | null {
        for (const layer of layers) {
            if (layer.name === name) return layer
            if (layer.children) {
                const found = this.findLayerByName(layer.children, name)
                if (found) return found
            }
        }
        return null
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

customElements.define("psd-viewer", PsdElement)

export { PsdElement }
