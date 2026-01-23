import { Awaits } from "../Awaits"
import { RegExpDict } from "../RegExpDict"
import { Transition } from "../Transition"
import { FadeOption } from "./Pages"

/**
 * domのセットアップ、保持、フェードを行う。
 */
export class PageDom {
    readonly container: HTMLElement
    private readonly pages = new RegExpDict<HTMLElement>({})

    readonly ready

    constructor(container: HTMLElement, html: string) {
        // Initialize container
        this.container = container
        this.ready = this.setup(html)
    }

    async fadeOut(currentPageId: string, { msOut }: FadeOption = {}) {
        const from = this.getPage(currentPageId)

        await Transition.fadeOut(this.container, msOut)
        from.classList.add("hidden")
    }

    async fadeIn(nextPageId: string, { msIn }: FadeOption = {}) {
        const to = this.getPage(nextPageId)

        to.classList.remove("hidden")
        await Transition.fadeIn(this.container, msIn)
    }

    getPage(pageId: string, option: { noError: true }): HTMLElement | undefined
    getPage(pageId: string, option?: { noError?: false }): HTMLElement
    getPage(pageId: string, option: { noError?: boolean } = {}) {
        const page = this.pages.get(pageId)

        if (option.noError) {
            return page
        }

        if (!page) {
            throw new Error("存在しないページを得ようとした。")
        }

        return page
    }

    getAllPages(pageId: string) {
        return this.pages.getAll(pageId)
    }

    private async setup(html: string) {
        this.container.style.display = "none"
        this.container.innerHTML = html

        // Initialize pages
        Array.from(this.container.querySelectorAll(".page"))
            .filter((e) => e instanceof HTMLElement)
            .forEach((page) => {
                this.pages.add(page.id, page)
                page.classList.add("hidden")
            })

        const load = Promise.all([
            Awaits.waitCSSLoad(this.container),
            Awaits.waitElementReady(this.container),
            //
        ])

        await Awaits.timeOver(5000, load, () => {
            console.warn("pageの読み込みに時間掛かり過ぎ! スキップしました。")
        })

        this.container.style.display = ""
    }
}
