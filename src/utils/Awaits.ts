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
}
