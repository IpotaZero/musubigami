import { PageDom } from "./PageDom"
import { PageRun } from "./PageRun"
import { PageState } from "./PageState"

export type PageButton = HTMLElement | SVGElement

export type FadeOption = Partial<{ msIn: number; msOut: number }>
type LoadOption = Partial<{ history: string[] }>

/**
 * Pages <- Dom, Run, State
 */

export class Pages {
    private static readonly DEFAULT_IN_MS = 250
    private static readonly DEFAULT_OUT_MS = 250

    private dom!: PageDom
    private state!: PageState

    private readonly run = new PageRun()
    onEnter = this.run.setOnEnter.bind(this.run)
    onLeft = this.run.setOnLeft.bind(this.run)
    beforeEnter = this.run.setBeforeEnter.bind(this.run)

    async loadFromFile(container: HTMLElement, path: string, options: LoadOption = {}) {
        const html = await fetch(path).then((res) => res.text())
        await this.load(container, html, options)
    }

    async load(container: HTMLElement, html: string, { history }: LoadOption = {}) {
        if (this.dom) {
            throw new Error("Pages have already been loaded")
        }

        this.state = new PageState(history)
        this.dom = new PageDom(container, html)
        await this.dom.ready
        this.setupButtonsOnclick()

        await this.goto(this.state.currentPageId, { msIn: 0, msOut: 0 })
    }

    getPage(pageId: string, option: { noError: true }): HTMLElement | undefined
    getPage(pageId: string, option?: { noError?: false }): HTMLElement
    getPage(pageId: string, option: { noError?: boolean } = {}) {
        if (option.noError) {
            return this.dom.getPage(pageId, { noError: true })
        } else {
            return this.dom.getPage(pageId)
        }
    }

    getCurrentPage() {
        return this.dom.getPage(this.state.currentPageId)
    }

    getCurrentPageId(): string {
        return this.state.currentPageId
    }

    private setupButtonsOnclick() {
        this.dom.container.querySelectorAll<PageButton>("[data-link]").forEach(this.setupLinkButton.bind(this))
        this.dom.container.querySelectorAll<PageButton>("[data-back]").forEach(this.setupBackButton.bind(this))
    }

    private setupLinkButton(button: PageButton) {
        const id = button.dataset.link || "first"
        const msIn = parseToNumber(button.dataset["msIn"], Pages.DEFAULT_IN_MS)
        const msOut = parseToNumber(button.dataset["msOut"], Pages.DEFAULT_OUT_MS)

        button.onclick = () => this.goto(id, { msIn, msOut })
    }

    private setupBackButton(button: PageButton) {
        const depth = Number(button.dataset.back) || 1
        const msIn = parseToNumber(button.dataset["msIn"], Pages.DEFAULT_IN_MS)
        const msOut = parseToNumber(button.dataset["msOut"], Pages.DEFAULT_OUT_MS)

        button.onclick = () => this.back(depth, { msIn, msOut })
    }

    async back(depth: number, option: FadeOption = {}) {
        await this.goto(this.state.back(depth), option)
    }

    async goto(id: string, { msIn = Pages.DEFAULT_IN_MS, msOut = Pages.DEFAULT_OUT_MS }: FadeOption = {}) {
        // 0. 遷移中に別の遷移が発生しないように
        if (this.state.isTransitioning()) return
        this.state.startTransition()

        // 1. 遷移可能かチェック（ガード節）
        const canTransition = await this.run.beforeEnter(this, id)
        if (!canTransition) {
            this.state.endTransition()
            return
        }

        // 2. 現在のページを去る
        await this.dom.fadeOut(this.state.currentPageId, { msOut })
        await this.run.onLeft(this, this.state.currentPageId)

        // 3. 状態の更新
        this.state.goto(id)

        // 4. 新しいページに入る
        await this.run.onEnter(this, id)
        await this.dom.fadeIn(id, { msIn })

        // 5. 遷移完了
        this.state.endTransition()
    }
}

function parseToNumber(str: string | undefined | null, defaultValue: number) {
    if (!str) return defaultValue

    if (Number.isNaN(Number(str))) return defaultValue

    return Number(str)
}
