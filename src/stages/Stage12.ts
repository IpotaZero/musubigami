import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, -100, { switch: true, life: 10 }],
        [-150, 0],
        [-50, -50],
        [0, 50],
        [-100, 100],
        [100, 100, { switch: true }],
        [50, -50, { switch: true, life: 5 }],
        [150, 0],
        [150, -100],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 2],
            [0, 8, { valid: false, multiplicity: 2 }],
            [1, 2],
            [2, 3, { multiplicity: 2 }],
            [2, 6],
            [3, 4],
            [3, 6],
            [4, 5],
            [5, 3, { valid: false }],
            [6, 7, { valid: false }],
            [6, 8, { valid: false }],
            [7, 8, { valid: false }],
        ],
    }
}
