import { RegExpDict } from "../RegExpDict"
import { Pages } from "./Pages"

type OnEnterHandler = (pages: Pages) => Promise<void> | void
type OnLeftHandler = (pages: Pages) => Promise<void> | void
type BeforeEnterHandler = (pages: Pages) => Promise<void | boolean> | boolean | void

/**
 * handlerの保持と実行。
 */
export class PageRun {
    private readonly onEnterHandlers = new RegExpDict<OnEnterHandler>()
    private readonly onLeftHandlers = new RegExpDict<OnLeftHandler>()
    private readonly beforeEnterHandlers = new RegExpDict<BeforeEnterHandler>()

    setOnEnter(selector: string, handler: OnEnterHandler) {
        this.onEnterHandlers.add(selector, handler)
    }

    setOnLeft(selector: string, handler: OnLeftHandler) {
        this.onLeftHandlers.add(selector, handler)
    }

    setBeforeEnter(selector: string, handler: BeforeEnterHandler) {
        this.beforeEnterHandlers.add(selector, handler)
    }

    onEnter(pages: Pages, id: string) {
        return Promise.all(this.onEnterHandlers.getAll(id).map((handler) => handler(pages)))
    }

    onLeft(pages: Pages, id: string) {
        return Promise.all(this.onLeftHandlers.getAll(id).map((handler) => handler(pages)))
    }

    async beforeEnter(pages: Pages, id: string) {
        const result = Array.from(this.beforeEnterHandlers.getAll(id).map((handler) => handler(pages)))

        if (result.length === 0) return true

        const p = await Promise.all(result)
        const canTransition = p.every(Boolean)
        return canTransition
    }
}
