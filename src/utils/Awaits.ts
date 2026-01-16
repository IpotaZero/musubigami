export class Awaits {
    static async fadeOut(container: HTMLElement, ms: number = 200) {
        container.style.transition = "opacity 0s"
        container.style.pointerEvents = "none"

        await Awaits.frame(() => {
            container.style.opacity = "1"
        })

        await Awaits.frame(() => {
            container.style.transition = `opacity ${ms}ms`
            container.style.opacity = "0"
        })

        await Awaits.sleep(ms)
    }

    static async fadeIn(container: HTMLElement, ms: number = 200) {
        container.style.transition = "opacity 0s"
        container.style.pointerEvents = "none"

        await Awaits.frame(() => {
            container.style.opacity = "0"
        })

        await Awaits.frame(() => {
            container.style.transition = `opacity ${ms}ms`
            container.style.opacity = "1"
        })

        await Awaits.sleep(ms)

        await Awaits.frame(() => {
            container.style.pointerEvents = ""
        })
    }

    static async valeOut(container: HTMLElement, ms: number = 200) {
        container.style.pointerEvents = "none"

        const vale = document.createElement("div")
        vale.classList.add("vale")
        vale.style.transition = `left ${ms}ms cubic-bezier(0.37, 0, 0.63, 1)`

        document.body.appendChild(vale)

        await Awaits.frame()

        await Awaits.frame(() => {
            vale.style.left = "0"
        })

        await Awaits.sleep(ms)
    }

    static async valeIn(container: HTMLElement, ms: number = 200) {
        const vale = document.querySelector<HTMLDivElement>(".vale")
        if (!vale) return
        vale.style.transition = `left ${ms}ms cubic-bezier(0.12, 0, 0.39, 0)`

        await Awaits.frame(() => {
            vale.style.left = "calc(100dvw + 4em)"
        })
        await Awaits.sleep(ms)

        document.body.removeChild(vale)

        container.style.pointerEvents = ""
    }

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
}
