import { Vertex } from "../Game"

export function stage() {
    const vertices: Vertex[] = Array.from({ length: 5 }, (_, i) => [
        Math.sin((i * (2 * Math.PI)) / 5) * 100,
        -Math.cos((i * (2 * Math.PI)) / 5) * 100,
    ])

    return {
        vertices,
        edges: [
            [0, 1, 1, true],
            [1, 2, 1, true],
            [2, 3, 1, true],
            [3, 4, 1, true],
            [4, 0, 1, true],

            [4, 1, 1, true],
        ],
    }
}
