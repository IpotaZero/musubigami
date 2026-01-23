import { FadeOption, parseToNumber } from "./Pages"

type OnclickHandlers = {
    enter: (id: string, option: FadeOption) => void
    back: (depth: number, option: FadeOption) => void
}

type PageButton = HTMLElement | SVGElement

/**
 * linkやbackがクリックされたときのメソッドを設定する。
 */
export class PageEventSetter {
    private static readonly DEFAULT_IN_MS = 250
    private static readonly DEFAULT_OUT_MS = 250

    static setOnclick(container: HTMLElement, { enter, back }: OnclickHandlers) {
        container.querySelectorAll<PageButton>("[data-link]").forEach((button) => {
            const id = button.dataset.link || "first"
            const msIn = parseToNumber(button.dataset["msIn"], this.DEFAULT_IN_MS)
            const msOut = parseToNumber(button.dataset["msOut"], this.DEFAULT_OUT_MS)
            button.onclick = () => enter(id, { msIn, msOut })
        })

        container.querySelectorAll<PageButton>("[data-back]").forEach((button) => {
            const depth = parseToNumber(button.dataset["back"], 1)
            const msIn = parseToNumber(button.dataset["msIn"], this.DEFAULT_IN_MS)
            const msOut = parseToNumber(button.dataset["msOut"], this.DEFAULT_OUT_MS)
            button.onclick = () => back(depth, { msIn, msOut })
        })
    }
}
