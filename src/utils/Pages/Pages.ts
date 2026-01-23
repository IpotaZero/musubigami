import { PageDom } from "./PageDom"
import { PageEventSetter } from "./PageEventSetter"
import { PageRun } from "./PageRun"
import { PageState } from "./PageState"

export type FadeOption = Partial<{ msIn: number; msOut: number }>
type GotoOption = FadeOption & { back?: boolean }
type LoadOption = Partial<{ history: string[] }>

/**
 * Pages <- Dom, Run, State, EventSetter
 */

export class Pages {
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

        this.dom = new PageDom(container, html)
        await this.dom.ready

        // イベントバインドを外部に委譲
        PageEventSetter.setOnclick(this.dom.container, {
            enter: this.enter.bind(this),
            back: this.back.bind(this),
        })

        this.state = new PageState(history)

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

    getAllPages(pageId: string) {
        return this.dom.getAllPages(pageId)
    }

    getCurrentPage() {
        return this.dom.getPage(this.state.currentPageId)
    }

    getCurrentPageId(): string {
        return this.state.currentPageId
    }

    async back(depth: number, option: FadeOption = {}) {
        await this.goto(this.state.back(depth), Object.assign(option, { back: true }))
    }

    async enter(id: string, option: FadeOption = {}) {
        await this.goto(id, Object.assign(option, { back: false }))
    }

    private async goto(id: string, option: GotoOption) {
        // 0. 遷移中に別の遷移が発生しないように
        if (this.state.isTransitioning()) return
        this.state.startTransition()

        // 1. 遷移可能かチェック（ガード節）
        const canTransition = await this.run.beforeEnter(this, id)
        if (!canTransition) {
            this.state.endTransition()
            return
        }

        // layerに応じて場合分け
        const layerFrom = parseToNumber(this.dom.getPage(this.state.currentPageId).dataset["layer"], 0)
        const layerTo = parseToNumber(this.dom.getPage(id).dataset["layer"], 0)
        await this.transition(layerFrom, layerTo, id, option)

        // 5. 遷移完了
        this.state.endTransition()
    }

    private async transition(layerFrom: number, layerTo: number, id: string, { msIn, msOut, back }: GotoOption) {
        if (layerFrom === layerTo) {
            // 2. 現在のページを去る
            await this.dom.fadeOut(this.state.currentPageId, { msOut })
            await this.run.onLeft(this, this.state.currentPageId)

            // 3. 状態の更新
            this.state.goto(id)

            // 4. 新しいページに入る
            await this.run.onEnter(this, id)
            await this.dom.fadeIn(id, { msIn })
        } else if (layerFrom < layerTo) {
            this.state.goto(id)

            await this.run.onEnter(this, id)
            await this.dom.fadeIn(id, { msIn })
        } else {
            if (!back) throw new Error("下のlayerにback以外でgotoしようとした。")

            await this.dom.fadeOut(this.state.currentPageId, { msOut })
            await this.run.onLeft(this, this.state.currentPageId)

            this.state.goto(id)
        }
    }
}

export function parseToNumber(str: string | undefined | null, defaultValue: number) {
    if (!str) return defaultValue

    if (Number.isNaN(Number(str))) return defaultValue

    return Number(str)
}
