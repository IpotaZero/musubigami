import { Awaits } from "../utils/Awaits.js"
import { Scene } from "./Scene.js"

type FadeFunction = (container: HTMLElement, ms: number) => Promise<void>

export class SceneChanger {
    static #currentScene: Scene

    static init(firstScene: Scene) {
        this.#currentScene = firstScene
        return this.#currentScene.ready
    }

    static async goto(
        newScene: () => Scene,
        {
            showLoading = this.#showLoading,
            hideLoading = this.#hideLoading,
            fadeOut = Awaits.fadeOut,
            fadeIn = Awaits.fadeIn,
            msIn = 500,
            msOut = 500,
        }: {
            showLoading?: () => void
            hideLoading?: () => void
            fadeOut?: FadeFunction
            fadeIn?: FadeFunction
            msIn?: number
            msOut?: number
        } = {},
    ) {
        const container = document.getElementById("container")!

        await fadeOut(container, msIn)
        await this.#currentScene.end()

        let done = false
        let showed = false

        // 1秒タイマーを並行実行
        Awaits.sleep(1000).then(() => {
            if (!done) {
                showLoading() // ローディング画面表示
                showed = true
            }
        })

        this.#currentScene = newScene()
        await this.#currentScene.ready // メイン処理実行
        done = true // 1秒以内に終わればローディングは表示されない

        if (showed) {
            hideLoading()
        }

        await fadeIn(container, msOut)
    }

    static #showLoading() {
        const p = document.createElement("p")
        p.textContent = "Loading..."
        p.classList.add("loading")
        document.body.appendChild(p)
    }

    static #hideLoading() {
        document.querySelectorAll(".loading").forEach((e) => e.remove())
    }
}
