import { Awaits } from "./Awaits"
import { RegExpDict } from "./RegExpDict"

type OnHandler = (pages: Pages) => void
type BeforeHandler = (pages: Pages) => Promise<void | boolean>
type LeftHandler = (pages: Pages) => void

type PageButton = HTMLElement | SVGElement

type FadeOption = Partial<{ msIn: number; msOut: number }>
type LoadOption = Partial<{ history: string[] }>

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

    async loadFromFile(container: HTMLElement, path: string, options: LoadOption = {}) {
        const html = await fetch(path).then((res) => res.text())
        await this.load(container, html, options)
    }

    async load(container: HTMLElement, html: string, { history }: LoadOption = {}) {
        if (this.#loaded) {
            throw new Error("Pages have already been loaded")
        }
        this.#loaded = true

        // Initialize container
        this.#container = container
        this.#container.innerHTML = html
        this.#container.style.display = "none"
        await waitCSSLoad(this.#container)
        this.#container.style.display = ""

        // Initialize history
        const first = history && history.length ? history.at(-1)! : "first"
        this.#history = history && history.length ? history.slice(0, -1) : []

        // Initialize pages
        Array.from(container.querySelectorAll(".page"))
            .filter((e) => e instanceof HTMLElement)
            .forEach((page) => {
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

    async goto(id: string, option: FadeOption = {}) {
        const { msIn = Pages.#defaultMSIn, msOut = Pages.#defaultMSOut } = option

        // 1. 遷移可能かチェック（ガード節）
        if (await this.#runBefore(id)) return

        // 2. 現在のページから退場
        await this.#leaveCurrentPage(msOut)

        // 3. 状態の更新
        this.#updateState(id)

        // 4. 新しいページへの入場
        await this.#enterNewPage(id, msIn)
    }

    // --- 内部手続きを細分化 ---

    async #leaveCurrentPage(msOut: number) {
        this.#runLeft(this.#currentPageId)

        const from = this.getCurrentPage()
        if (from) {
            await Awaits.fadeOut(from, msOut)
            from.classList.add("hidden")
        }
    }

    #updateState(nextId: string) {
        this.#history.push(nextId)
        this.#currentPageId = nextId
    }

    async #enterNewPage(nextId: string, msIn: number) {
        this.#runOn(nextId)

        const to = this.pages.get(nextId)
        if (!to) return

        to.classList.remove("hidden")
        await Awaits.fadeIn(to, msIn)
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

function waitCSSLoad(container: Element) {
    const links = Array.from(container.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    return Promise.all(
        links.map((link) => {
            if (link.sheet) return Promise.resolve() // すでに読み込み済み
            return new Promise((resolve) => {
                link.onload = resolve
                link.onerror = resolve // エラー時も進めるようにする
            })
        }),
    )
}
