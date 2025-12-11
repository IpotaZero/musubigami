import { Awaits } from "./Awaits"

export type SerifCommand = string | { type: "character"; icon: string } | { type: "background"; image: string }

export class Serif {
    static readonly #container = document.createElement("div")
    static #background: HTMLDivElement
    static #window: HTMLDivElement
    static #iconContainer: HTMLDivElement
    static #textContainer: HTMLDivElement
    static #Z: HTMLSpanElement

    static #mode: "say" | "ask" = "say"

    static #resolve = () => {}

    static #cue: SerifCommand[] = []

    static init() {
        this.#container.innerHTML = `
            <div id="serif-background"></div>
            <div id="serif-window">
                <div id="serif-icon-container" class="hidden"></div>
                <div id="serif-text-container" class="text-end"></div>
                <span id="serif-Z">[Z]長押しでスキップ</span>
            </div>
        `

        this.#background = this.#container.querySelector("#serif-background")!
        this.#window = this.#container.querySelector("#serif-window")!
        this.#iconContainer = this.#container.querySelector("#serif-icon-container")!
        this.#textContainer = this.#container.querySelector("#serif-text-container")!
        this.#Z = this.#container.querySelector("#serif-Z")!

        this.#container.id = "serif-container"
        document.body.appendChild(this.#container)

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
        })
    }

    static ask(title: string, choices: string[]): Promise<number> {
        this.#mode = "ask"
        this.#Z.classList.add("hidden")
        this.#reset()

        this.#textContainer.innerHTML = title + "<br/>"
        this.#textContainer.classList.remove("fade-in")
        this.#textContainer.classList.remove("text-end")

        requestAnimationFrame(() => {
            this.#textContainer.classList.add("fade-in")
        })

        return new Promise<number>((resolve) => {
            choices.forEach((choice, index) => {
                const button = document.createElement("button")
                button.textContent = choice
                button.addEventListener("click", () => {
                    this.#container.classList.remove("shown")

                    resolve(index)
                })
                this.#textContainer.appendChild(button)
            })
            this.#container.classList.add("shown")
        })
    }

    static say(...texts: SerifCommand[]) {
        this.#mode = "say"
        this.#Z.classList.remove("hidden")
        this.#reset()

        this.#textContainer.innerHTML = ""
        this.#container.classList.add("shown")
        this.#cue = texts
        this.#textContainer.classList.add("text-end")
        this.#say()

        const promise = new Promise<void>((resolve) => {
            this.#resolve = resolve
        })

        return promise
    }

    static #say() {
        if (this.#cue.length === 0) {
            this.#container.classList.remove("shown")
            Awaits.sleep(200).then(() => {
                this.#reset()
            })
            this.#resolve()
            return
        }

        const command = this.#cue.shift()!

        if (typeof command === "string") {
            this.#textContainer.innerHTML = command
            this.#textContainer.classList.remove("fade-in")
            requestAnimationFrame(() => {
                this.#textContainer.classList.add("fade-in")
            })
        } else if (command.type === "character") {
            if (command.icon === "none") {
                this.#iconContainer.classList.add("hidden")
            } else {
                this.#iconContainer.innerHTML = `<img src="${command.icon}" alt="" />`
                this.#iconContainer.classList.remove("hidden")
            }

            this.#say()
        } else if (command.type === "background") {
            this.#background.innerHTML = `<img src="${command.image}" alt="" class="fade-in"/>`
            this.#say()
        }
    }

    static #reset() {
        this.#container.style.cursor = { "say": "pointer", "ask": "default" }[this.#mode]
        this.#background.innerHTML = ""
        this.#iconContainer.classList.add("hidden")
    }
}
