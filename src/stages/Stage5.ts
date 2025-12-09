import { Vertex } from "../Game"

export function stage() {
    const vertices: Vertex[] = [
        [0, -100],
        [-150, 0],
        [150, 0],
        [0, 100],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 1, 1, true],
            [2, 3],
            [3, 0, 2, true],
        ],
    }
}
