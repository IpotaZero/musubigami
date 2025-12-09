export class Dom {
    static container: HTMLElement

    static init() {
        this.container = document.getElementById("container")!
        this.#check()
    }

    static #check() {
        if (!this.container) {
            throw new Error("Container element not found")
        }
    }
}
