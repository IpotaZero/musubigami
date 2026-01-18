export type ConfettiOptions = Partial<{
    particleCount: number
    durationMs: number
}>

export function startConfetti(
    container: HTMLElement,
    { particleCount = 150, durationMs = 2000 }: ConfettiOptions = {},
) {
    const css = `
        .confetti {
            position: absolute;
            width: 2dvh;
            height: 2dvh;
            top: -100%;
            pointer-events: none;
        }
    `

    const style = document.createElement("style")
    style.innerHTML = css
    container.appendChild(style)

    const COLORS = ["#ff4d4f", "#40a9ff", "#73d13d", "#ffd666", "#9254de", "#ff85c0"]

    Array.from({ length: particleCount }).forEach(() => {
        const particle = document.createElement("span")
        particle.classList.add("confetti")
        particle.style.left = `${Math.random() * 100}%`
        particle.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)]

        const left = Math.random() * 100
        const offset = (Math.random() * 2 - 1) * 25
        const keyframes = [
            { top: "-10%", left: `${left}%`, transform: "rotate3D(1,1,1,0deg)", opacity: "1" },
            { top: "100%", left: `${left + offset}%`, transform: "rotate3D(1,1,1,720deg)", opacity: "0.5" },
        ]

        const animation = particle.animate(keyframes, { delay: Math.random() * 1500, duration: durationMs })

        animation.onfinish = () => {
            particle.remove()
        }

        container.appendChild(particle)
    })
}
