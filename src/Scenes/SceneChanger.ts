import { Awaits } from "../utils/Awaits.js"
import { Transition } from "../utils/Transition.js"
import { Scene } from "./Scene.js"

type FadeFunction = (container: HTMLElement, ms: number) => Promise<void>

export class SceneChanger {
    static #currentScene: Scene

    static init(firstScene: Scene) {
        this.#currentScene = firstScene
        return this.#currentScene.ready
    }

    static async goto(
        newScene: () => Promise<Scene>,
        {
            showLoading = this.#showLoading,
            hideLoading = this.#hideLoading,

            fadeOut = Transition.fadeOut,
            fadeIn = Transition.fadeIn,

            msIn = 500,
            msOut = 500,

            afterLoad = () => {},
        }: {
            showLoading?: () => void
            hideLoading?: () => void
            fadeOut?: FadeFunction
            fadeIn?: FadeFunction
            msIn?: number
            msOut?: number

            afterLoad?: () => void
        } = {},
    ) {
        const container = document.getElementById("container")!

        await Promise.all([this.#currentScene.end(), fadeOut(container, msIn)])

        this.#currentScene = await newScene()

        let showed = false

        await Awaits.loading(1000, this.#currentScene.ready, () => {
            showLoading() // ローディング画面表示
            showed = true
        })

        if (showed) {
            hideLoading()
        }

        afterLoad() // 読み込み後処理

        await fadeIn(container, msOut)
    }

    static #showLoading() {
        const p = document.createElement("p")
        p.textContent = "Loading"
        p.classList.add("loading")
        document.body.appendChild(p)
    }

    static #hideLoading() {
        document.querySelectorAll(".loading").forEach((e) => e.remove())
    }
}
