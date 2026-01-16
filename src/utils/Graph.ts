type MapData = {
    vertices: [number, number][]
    edges: [number, number][]
    events: [number, number, string, string, { bgm?: string }?][]
}

export class Graph extends HTMLElement {
    private resolve = () => {}

    readonly ready = new Promise<void>((resolve) => {
        this.resolve = resolve
    })

    connectedCallback() {
        const svgNS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(svgNS, "svg")
        svg.setAttribute("viewBox", "0 0 400 300")
        this.appendChild(svg)

        this.#render(svg)
    }

    getConnectedVertices(vertexId: number) {
        const vertices: number[] = []

        this.querySelectorAll<SVGLineElement>(`.path[data-from="${vertexId}"]`).forEach((edge) => {
            vertices.push(Number(edge.dataset["to"]))
        })

        this.querySelectorAll<SVGLineElement>(`.path[data-to="${vertexId}"]`).forEach((edge) => {
            vertices.push(Number(edge.dataset["from"]))
        })

        const vertexElements: SVGRectElement[] = Array.from(this.querySelectorAll(".stage"))

        return vertices.map((i) => vertexElements[i])
    }

    async #render(svg: SVGSVGElement) {
        const url = this.getAttribute("src")

        if (url) {
            await fetch(url)
                .then((res) => res.json())
                .then((data: MapData) => {
                    this.#renderGraph(svg, data)
                })
        }
    }

    #renderGraph(svg: SVGSVGElement, { vertices, edges, events }: MapData) {
        const svgNS = "http://www.w3.org/2000/svg"

        // Clear existing content
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild)
        }

        // Draw edges
        edges.forEach((edge) => {
            const line = document.createElementNS(svgNS, "line")
            const [x1, y1] = vertices[edge[0]]
            const [x2, y2] = vertices[edge[1]]
            line.setAttribute("x1", x1.toString())
            line.setAttribute("y1", y1.toString())
            line.setAttribute("x2", x2.toString())
            line.setAttribute("y2", y2.toString())
            line.classList.add("path", "hidden")
            line.dataset["from"] = `${edge[0]}`
            line.dataset["to"] = `${edge[1]}`
            svg.appendChild(line)
        })

        // Draw vertices
        vertices.forEach(([x, y], index) => {
            const rect = document.createElementNS(svgNS, "rect")
            rect.setAttribute("x", (x - 20).toString())
            rect.setAttribute("y", (y - 20).toString())
            rect.setAttribute("width", "40")
            rect.setAttribute("height", "40")
            rect.classList.add("stage", "hidden")
            svg.appendChild(rect)

            // const text = document.createElementNS(svgNS, "text")
            // text.setAttribute("x", x.toString())
            // text.setAttribute("y", (y + 4).toString())
            // text.setAttribute("text-anchor", "middle")
            // text.setAttribute("font-size", "1")
            // text.setAttribute("fill", "#111")
            // text.textContent = `${index}`
            // svg.appendChild(text)
        })

        // Draw events
        events.forEach(([x, y, url, id, option]) => {
            const image = document.createElementNS(svgNS, "image")
            image.setAttribute("href", url)
            image.setAttribute("x", x.toString())
            image.setAttribute("y", y.toString())
            image.setAttribute("width", "40")
            image.setAttribute("height", "40")
            image.dataset["eventName"] = id
            image.dataset["bgm"] = option ? option.bgm : ""
            image.classList.add("event")
            svg.appendChild(image)
        })

        this.resolve()
    }
}

customElements.define("x-graph", Graph)
