import { SE } from "../SE"
import { Awaits } from "./Awaits"
import { PsdElement } from "./PsdElement"

export type SerifCommand =
    | string
    | { type: "background"; image: string }
    | { type: "portrait"; url: string; name: string; side?: string }
    | { type: "portrait-change"; name: string; layers: string }

export class Serif {
    static readonly #container = document.createElement("div")
    static #background: HTMLDivElement
    static #window: HTMLDivElement
    static #iconContainer: HTMLDivElement
    static #textContainer: HTMLDivElement
    static #ZHint: HTMLSpanElement

    static #mode: "say" | "ask" = "say"

    static #resolve = () => {}

    static #cue: SerifCommand[] = []

    static init() {
        this.#setupContainer()
        this.#cacheElements()
        this.#bindEvents()
    }

    static #setupContainer() {
        this.#container.innerHTML = `
            <div id="serif-background"></div>
            <div id="serif-window">
                <div id="serif-icon-container" class="hidden"></div>
                <div id="serif-text-container" class="text-end"></div>
                <span id="serif-Z">[Z]長押しでスキップ</span>
            </div>
        `

        this.#container.id = "serif-container"
        document.body.appendChild(this.#container)
    }

    static #cacheElements() {
        this.#background = this.#container.querySelector("#serif-background")!
        this.#window = this.#container.querySelector("#serif-window")!
        this.#iconContainer = this.#container.querySelector("#serif-icon-container")!
        this.#textContainer = this.#container.querySelector("#serif-text-container")!
        this.#ZHint = this.#container.querySelector("#serif-Z")!
    }

    static #bindEvents() {
        this.#container.addEventListener("click", () => {
            if (this.#mode === "say") {
                this.#say()
            }
        })

        window.addEventListener("keydown", (e) => {
            if (["KeyZ", "Enter", "Space"].includes(e.code)) {
                if (this.#mode === "say") {
                    this.#say()
                }
            }

            if (e.code === "KeyX") {
                this.#window.classList.toggle("hidden")
            }
        })
    }

    static ask(title: string, choices: string[]): Promise<number> {
        this.#mode = "ask"
        this.#ZHint.classList.add("hidden")
        this.#reset()

        this.#textContainer.innerHTML = title

        requestAnimationFrame(() => {
            this.#textContainer.dataset["mode"] = "ask"
            this.#textContainer.classList.add("fade-in")
        })

        return new Promise<number>((resolve) => {
            choices.forEach((choice, index) => {
                const button = document.createElement("button")
                button.textContent = choice

                button.onclick = () => {
                    this.#container.classList.remove("shown")
                    resolve(index)
                }

                this.#textContainer.appendChild(button)
            })

            this.#container.classList.add("shown")
        })
    }

    static say(...texts: SerifCommand[]) {
        if (texts.length === 0) {
            return Promise.resolve()
        }

        this.#textContainer.dataset["mode"] = "say"
        this.#mode = "say"
        this.#ZHint.classList.remove("hidden")
        this.#reset()

        this.#cue = texts
        this.#textContainer.classList.add("text-end")

        requestAnimationFrame(() => {
            this.#container.classList.add("shown")
        })

        this.#say()

        return new Promise<void>((resolve) => {
            this.#resolve = resolve
        })
    }

    static #say() {
        if (this.#cue.length === 0) {
            this.#container.classList.remove("shown")
            Awaits.sleep(400).then(() => {
                this.#reset()
            })
            this.#resolve()
            return
        }

        this.#processCommand()
    }

    static #processCommand() {
        const command = this.#cue.shift()!

        if (typeof command === "string") {
            SE.voice.play()
            this.#textContainer.innerHTML = command
            this.#textContainer.classList.remove("fade-in")
            requestAnimationFrame(() => {
                this.#textContainer.classList.add("fade-in")
            })
        } else if (command.type === "background") {
            this.#background.innerHTML = `<img src="${command.image}" alt="" class="fade-in"/>`
            this.#say()
        } else if (command.type === "portrait") {
            const psd = new PsdElement({ url: `${command.url}`, layers: "normal" })
            psd.classList.add("serif-portrait", "hidden")
            psd.classList.add(command.side ?? "left")
            psd.id = command.name
            this.#container.appendChild(psd)
            this.#say()
        } else if (command.type === "portrait-change") {
            const psd = this.#container.querySelector<PsdElement>(`#${command.name}`)!
            psd.layers = command.layers
            psd.classList.remove("hidden")
            this.#say()
        }
    }

    static #reset() {
        this.#window.classList.remove("hidden")
        this.#container.style.cursor = { "say": "pointer", "ask": "default" }[this.#mode]
        this.#background.innerHTML = ""
        this.#iconContainer.classList.add("hidden")
        this.#textContainer.classList.remove("fade-in")
        this.#textContainer.classList.remove("text-end")
        // this.#textContainer.innerHTML = ""
        this.#container.querySelectorAll("psd-viewer").forEach((p) => p.remove())
    }
}
