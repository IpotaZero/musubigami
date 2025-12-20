import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, -100],
        [-150, 100],
        [150, 100],
        [150, -100, { life: 3 }],
        [-50, -50],
        [-50, 50],
        [50, 50],
        [50, -50, { switch: true }],
    ]

    return {
        vertices,
        edges: [
            [0, 1, { valid: false }],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 7],
        ],
    }
}
