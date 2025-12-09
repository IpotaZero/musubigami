import { Awaits } from "./Awaits"

export type SerifCommand = string | { type: "character"; icon: string } | { type: "background"; image: string }

export class Serif {
    static readonly #container = document.createElement("div")
    static readonly #background = document.createElement("div")
    static readonly #window = document.createElement("div")
    static readonly #textContainer = document.createElement("div")
    static readonly #iconContainer = document.createElement("div")

    static #mode: "say" | "ask" = "say"

    static #resolve = () => {}

    static #cue: SerifCommand[] = []

    static init() {
        this.#background.id = "serif-background"
        this.#container.appendChild(this.#background)

        this.#window.id = "serif-window"
        this.#container.appendChild(this.#window)

        this.#iconContainer.id = "serif-icon-container"
        this.#iconContainer.classList.add("hidden")
        this.#window.appendChild(this.#iconContainer)

        this.#textContainer.id = "serif-text-container"
        this.#textContainer.classList.add("text-end")
        this.#window.appendChild(this.#textContainer)

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
