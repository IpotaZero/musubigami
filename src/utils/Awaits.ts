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

    static async timeOver<T>(ms: number, promise: Promise<T>, whenOver: () => T): Promise<T> {
        let timeoutId: ReturnType<typeof setTimeout>

        // 1. タイムアウト用の Promise
        const timeoutPromise = new Promise<T>((resolve) => {
            timeoutId = setTimeout(() => {
                resolve(whenOver())
            }, ms)
        })

        try {
            // 2. 本来の処理とタイマーを競わせる
            // Promise.race 自体は先に終わった方を返すが、
            // どちらの結果になっても finally でタイマーを解除する
            return await Promise.race([promise, timeoutPromise])
        } finally {
            // 3. どちらかが完了したらタイマーをクリアする
            // 本来の処理が ms 以内に終われば、whenOver の実行を阻止できる
            clearTimeout(timeoutId!)
        }
    }

    static async loading<T>(ms: 1000, promise: Promise<T>, whenOver: () => void) {
        let done = false

        Awaits.sleep(ms).then(() => {
            if (!done) {
                whenOver()
            }
        })

        const value = await promise
        done = true

        return value
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
