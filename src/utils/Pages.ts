import { Awaits } from "./Awaits"
import { RegExpDict } from "./RegExpDict"

type OnHandler = (pages: Pages) => void
type BeforeHandler = (pages: Pages) => Promise<void | boolean>
type LeftHandler = (pages: Pages) => void

type FadeOption = Partial<{ msIn: number; msOut: number }>

type PageButton = HTMLElement | SVGElement

export class Pages {
    static readonly #defaultMSIn = 250
    static readonly #defaultMSOut = 250

    readonly pages = new RegExpDict<HTMLElement>({})

    readonly #onHandlers = new RegExpDict<OnHandler>({})
    readonly #leftHandlers = new RegExpDict<LeftHandler>({})
    readonly #beforeHandlers = new RegExpDict<BeforeHandler>({})

    #container!: HTMLElement
    #history: string[] = []
    #currentPageId = "first" // これは消すべきでない

    #loaded = false

    async load(container: HTMLElement, html: string, { history }: { history?: string[] } = {}) {
        if (this.#loaded) {
            throw new Error("Pages have already been loaded")
        }
        this.#loaded = true

        // Initialize container
        this.#container = container
        this.#container.innerHTML = html

        // Initialize history
        const first = history && history.length ? history.at(-1)! : "first"
        this.#history = history && history.length ? history.slice(0, -1) : []

        // Initialize pages
        container.querySelectorAll<HTMLElement>(".page").forEach((page) => {
            this.pages.add(page.id, page)
            page.classList.add("hidden")
        })

        await this.goto(first, { msIn: 0, msOut: 0 })
        this.setupButtonsOnclick()
    }

    getCurrentPage() {
        return this.pages.get(this.#currentPageId)
    }

    getCurrentPageId(): string {
        return this.#currentPageId
    }

    on(selector: string, handler: OnHandler) {
        this.#onHandlers.add(selector, handler)
    }

    onLeft(selector: string, handler: LeftHandler) {
        this.#leftHandlers.add(selector, handler)
    }

    before(selector: string, handler: BeforeHandler) {
        this.#beforeHandlers.add(selector, handler)
    }

    setupButtonsOnclick() {
        this.#container.querySelectorAll<PageButton>("[data-back]").forEach(this.#setupBackButton.bind(this))
        this.#container.querySelectorAll<PageButton>("[data-link]").forEach(this.#setupLinkButton.bind(this))
    }

    #setupBackButton(button: PageButton) {
        const depth = Number(button.dataset.back) || 1
        const msIn = parseToNumber(button.dataset["ms-in"], Pages.#defaultMSIn)
        const msOut = parseToNumber(button.dataset["ms-Out"], Pages.#defaultMSOut)

        button.onclick = async () => {
            this.#togglePointerEvents(false)
            await this.back(depth, { msIn, msOut })
            this.#togglePointerEvents(true)
        }
    }

    #setupLinkButton(button: PageButton) {
        const id = button.dataset.link || "first"
        const msIn = parseToNumber(button.dataset["ms-in"], Pages.#defaultMSIn)
        const msOut = parseToNumber(button.dataset["ms-Out"], Pages.#defaultMSOut)

        button.onclick = async () => {
            this.#togglePointerEvents(false)
            await this.goto(id, {
                msIn,
                msOut,
            })
            this.#togglePointerEvents(true)
        }
    }

    async back(backDepth: number, option: FadeOption = {}) {
        for (let i = 0; i < backDepth; i++) {
            await this.#back(option)
        }
    }

    async #back(option: FadeOption = {}) {
        if (this.#history.length === 0) return
        this.#history.pop()
        await this.goto(this.#history.pop()!, option)
    }

    async goto(id: string, { msIn = Pages.#defaultMSIn, msOut = Pages.#defaultMSOut }: FadeOption = {}) {
        // 入る前に実行される物。キャンセルされたら入らない。
        const canceled = await this.#runBefore(id)
        if (canceled) return

        // 現在のページを去る際に実行される物。
        this.#runLeft(this.#currentPageId)

        const from = this.pages.get(this.#currentPageId)
        const to = this.pages.get(id)

        // fade out
        if (from) {
            await Awaits.fadeOut(from, msOut)
            from.classList.add("hidden")
        }

        // 更新
        this.#history.push(id)
        this.#currentPageId = id

        // 新しいページに入った時に実行される物。
        this.#runOn(this.#currentPageId)

        // fade in
        if (to) {
            to.classList.remove("hidden")
            await Awaits.fadeIn(to, msIn)
        }
    }

    async #runBefore(id: string) {
        const result = this.#beforeHandlers.getAll(id).map((handler) => handler(this))
        const p = await Promise.all(result)
        return p.some(Boolean)
    }

    #runLeft(id: string) {
        this.#leftHandlers.getAll(id).map((handler) => handler(this))
    }

    #runOn(id: string) {
        requestAnimationFrame(() => {
            this.#onHandlers.getAll(id).forEach((handler) => handler(this))
        })
    }

    #togglePointerEvents(available: boolean) {
        const page = this.getCurrentPage()

        if (!page) return

        page.querySelectorAll<PageButton>("[data-link], [data-back]").forEach((b) => {
            b.style.pointerEvents = available ? "" : "none"
        })
    }
}

function parseToNumber(str: string | undefined | null, defaultValue: number) {
    if (!str) return defaultValue

    if (Number.isNaN(Number(str))) return defaultValue

    return Number(str)
}
