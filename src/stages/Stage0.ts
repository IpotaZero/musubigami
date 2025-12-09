import { Vertex } from "../Game"

export function stage() {
    const vertices: Vertex[] = []

    for (let i = 0; i < 3; i++) {
        vertices.push([Math.sin((i * 2 * Math.PI) / 3) * 140, 40 - Math.cos((i * 2 * Math.PI) / 3) * 140])
    }

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 0],
        ],
    }
}
