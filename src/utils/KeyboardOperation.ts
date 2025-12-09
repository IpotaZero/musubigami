export class KeyboardOperation {
    static #ok = ["KeyZ"]
    static #cancel = ["KeyX"]

    static #maxIndex: [row: number, col: number] = [0, 0]
    static #currentPosition: [row: number, col: number] = [0, 0]

    static #container: HTMLElement
    static #ac = new AbortController()

    static init() {
        window.addEventListener("keydown", this.#onKeydown.bind(this), { signal: this.#ac.signal })
    }

    static update(container: HTMLElement) {
        this.#container = container
        this.#setupCurrentPosition()
        this.#setupMaxIndex()
        this.#updateClass()
    }

    static remove() {
        this.#ac.abort()
    }

    static #setupCurrentPosition() {
        this.#currentPosition = [0, 0]

        const b = Array.from(this.#container.querySelectorAll("button")).find((c) => c.classList.contains("active"))

        if (b && b instanceof HTMLElement) {
            this.#currentPosition = JSON.parse(`[${b.dataset["position"]!}]`)
        }
    }

    static #setupMaxIndex() {
        Array.from(this.#container.querySelectorAll("button"))
            .filter((c) => c.dataset["position"])
            .forEach((c) => {
                const p: [number, number] = JSON.parse(`[${c.dataset["position"]!}]`)

                if (!Array.isArray(p)) return

                if (p[0] > this.#maxIndex[0]) this.#maxIndex[0] = p[0]
                if (p[1] > this.#maxIndex[1]) this.#maxIndex[1] = p[1]
            })
    }

    static #onKeydown(e: KeyboardEvent) {
        this.#updateCurrentPosition(e)
        this.#updateClass()
        this.#onOk(e)
        this.#onCancel(e)
    }

    static #onOk(e: KeyboardEvent) {
        if (!KeyboardOperation.#ok.includes(e.code)) return

        const button = this.#findButtonFromPosition(this.#currentPosition)

        if (button) {
            button.click()
        }
    }

    static #onCancel(e: KeyboardEvent) {
        if (!KeyboardOperation.#cancel.includes(e.code)) return

        const button = this.#findBackButton()

        if (button) {
            button.click()
        }
    }

    static #updateCurrentPosition(e: KeyboardEvent) {
        switch (e.code) {
            case "ArrowUp":
                this.#currentPosition[0]--
                break
            case "ArrowDown":
                this.#currentPosition[0]++
                break
            case "ArrowLeft":
                this.#currentPosition[1]--
                break
            case "ArrowRight":
                this.#currentPosition[1]++
                break
        }

        this.#currentPosition[0] = clamp(this.#currentPosition[0], 0, this.#maxIndex[0])
        this.#currentPosition[1] = clamp(this.#currentPosition[1], 0, this.#maxIndex[1])
    }

    static #updateClass() {
        Array.from(this.#container.querySelectorAll("button"))
            .filter((c) => c.dataset["position"])
            .forEach((c) => {
                const p = JSON.parse(`[${c.dataset["position"]!}]`)

                if (!Array.isArray(p)) return

                const isFocused = p.join(",") === this.#currentPosition.join(",")
                c.classList.toggle("active", isFocused)
            })
    }

    static #findButtonFromPosition(position: [number, number]) {
        return Array.from(this.#container.querySelectorAll("button"))
            .filter((c) => c.dataset["position"])
            .find((c) => {
                const p: [number, number] = JSON.parse(`[${c.dataset["position"]!}]`)

                if (!Array.isArray(p)) return false

                return p[0] === position[0] && p[1] === position[1]
            })
    }

    static #findBackButton() {
        return Array.from(this.#container.querySelectorAll("button")).find(
            (c) => c.dataset["back"] || c.classList.contains("back"),
        )
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min)
}
