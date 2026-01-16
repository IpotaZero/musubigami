import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, 120],
        [-50, 60],
        [50, 60],
        [150, 120],
        [150, 40, { switch: true }],
        [150, -40],
        [150, -120],
        [50, -60],
        [-50, -60],
        [-150, -120],
        [-100, 0, { switch: true }],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 9],
            [1, 2, { valid: false, multiplicity: 3 }],
            [1, 8, { valid: false }],
            [1, 10, { multiplicity: 3, valid: false, arrow: true }],
            [2, 3, { valid: false }],
            [2, 4, { valid: false }],
            [2, 7, { valid: false }],
            [3, 4, { valid: false }],
            [4, 5],
            [5, 6],
            [5, 7],
            [6, 7],
            [7, 8, { multiplicity: 3 }],
            [8, 9],
            [8, 10, { multiplicity: 3 }],
        ],
    }
}
