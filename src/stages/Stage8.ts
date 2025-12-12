import { Vertex } from "../Game"

export function stage() {
    const vertices: Vertex[] = [
        [-150, -100],
        [-150, 100],
        [150, 100],
        [150, -100],
        [-50, -50],
        [-50, 50],
        [50, 50],
        [50, -50],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 3],
            [0, 4],
            [1, 2],
            [6, 2, 1, true],
            [2, 7],
            [2, 3],
            [3, 7],
            [4, 5, 3, true],
            [4, 7, 2],
            [5, 6, 3],
            [5, 1, 2, true],
            [6, 7, 2],
        ],
    }
}
