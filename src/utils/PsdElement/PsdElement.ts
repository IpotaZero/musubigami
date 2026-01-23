import { readPsd, Psd, Layer } from "ag-psd"
import { PsdRenderer } from "./PsdRenderer"

type PsdElementOptions = Partial<{ src: string; layers: string; mode: "contain" | "cover" }>

class PsdElement extends HTMLElement {
    static readonly observedAttributes = ["src", "layers", "mode"] as const

    private resizeObserver: ResizeObserver

    private psd: Psd | null = null
    private shadow!: ShadowRoot
    private container: HTMLDivElement = document.createElement("div")
    private renderer = new PsdRenderer(this.container)

    private resolve!: () => void
    readonly ready = new Promise<void>((resolve) => {
        this.resolve = resolve
    })

    constructor(options: PsdElementOptions = {}) {
        super()
        this.setupDOM()
        this.setupAttribute(options)

        this.resizeObserver = new ResizeObserver(() => {
            this.updateScale()
        })
        this.resizeObserver.observe(this)
    }

    private setupDOM() {
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
    }

    private setupAttribute(options: PsdElementOptions) {
        if (options.src) {
            this.setAttribute("src", options.src)
        }

        if (options.layers) {
            this.setAttribute("layers", options.layers)
        }

        this.setAttribute("mode", options.mode ?? this.getAttribute("mode") ?? "contain")
    }

    set layers(layers: string) {
        this.setAttribute("layers", layers)
    }

    get layers() {
        return this.getAttribute("layers") ?? ""
    }

    async attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return

        if (name === "src" && newValue) {
            this.psd = await PsdElement.fetchPsd(newValue)
            this.renderer.setBaseSize(this.psd.width, this.psd.height)
            this.renderLayers()
            this.resolve()
        } else if (name === "layers") {
            this.renderLayers()
        } else if (name === "mode") {
            this.updateScale()
        }
    }

    private static async fetchPsd(url: string): Promise<Psd> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const buffer = await response.arrayBuffer()

        return readPsd(buffer, { useImageData: true })
    }

    private renderLayers(): void {
        if (!this.psd || !this.psd.children) return

        const layersAttr = this.getAttribute("layers")
        if (!layersAttr) {
            this.container.innerHTML += '<p>Please specify a "layers" attribute.</p>'
            return
        }

        const layerNames = layersAttr.split(",").map((name) => name.trim())

        this.container.innerHTML = ""

        layerNames
            .map((name) => PsdElement.findLayerByName(this.psd!.children!, name))
            .forEach((layer) => {
                if (!layer) {
                    console.error("存在しないlayer名")
                    console.error(this)
                    return
                }

                this.renderer.appendCanvas(layer)
            })

        this.updateScale()
    }

    private updateScale() {
        const mode = this.getAttribute("mode") ?? "contain"
        if (mode !== "contain" && mode !== "cover") throw new Error("不正なモード")

        this.renderer.updateScale(this.clientWidth, this.clientHeight, {
            mode,
        })
    }

    private static findLayerByName(layers: Layer[], name: string): Layer | null {
        for (const layer of layers) {
            if (layer.name === name) return layer

            // layerがフォルダの場合
            if (layer.children) {
                const found = this.findLayerByName(layer.children, name)
                if (found) return found
            }
        }
        return null
    }
}

customElements.define("psd-viewer", PsdElement)

export { PsdElement }
