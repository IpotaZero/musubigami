export class Awaits {
    static sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    static ok() {
        const abort = new AbortController()

        return new Promise<void>((resolve) => {
            document.addEventListener(
                "click",
                () => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )

            document.addEventListener(
                "keydown",
                (e) => {
                    if (["KeyZ", "Enter", "Space"].includes(e.code)) {
                        abort.abort()
                        resolve()
                    }
                },
                { signal: abort.signal },
            )
        })
    }

    static key() {
        const abort = new AbortController()

        return new Promise<void>((resolve) => {
            document.addEventListener(
                "click",
                () => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )

            document.addEventListener(
                "keydown",
                (e) => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )
        })
    }

    static frame(fn = () => {}) {
        return new Promise<void>((resolve) =>
            requestAnimationFrame(() => {
                fn()
                resolve()
            }),
        )
    }

    static async timeOver(ms: number, promise: Promise<unknown>, whenOver: () => void): Promise<void> {
        let done = false

        const timeoutPromise = Awaits.sleep(ms).then(() => {
            if (!done) {
                whenOver()
            }
        })

        await Promise.race([promise, timeoutPromise])
        done = true
    }

    static async loading<T>(ms: number, promise: Promise<T>, whenOver: () => void) {
        let done = false
        let over = false

        Awaits.sleep(ms).then(() => {
            if (!done) {
                over = true
                whenOver()
            }
        })

        const value = await promise
        done = true

        return { value, over }
    }

    static waitElementReady(container: Element) {
        type ElementWithReady = Element & { ready: Promise<unknown> }

        const hasReadyPromise = Array.from(container.querySelectorAll("*")).filter(
            (e: any): e is ElementWithReady => e.ready instanceof Promise,
        )

        return Promise.all(hasReadyPromise.map((e) => e.ready))
    }

    static waitCSSLoad(container: Element) {
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
}
