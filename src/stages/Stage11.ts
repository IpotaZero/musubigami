import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [30, -120],
        [-60, -60],
        [-150, 120, { switch: true }],
        [-60, 120],
        [30, 120],
        [150, 120, { life: 7 }],
        [150, -60],
        [30, 0, { switch: true }],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2, { multiplicity: 2 }],
            [2, 3, { multiplicity: 2, valid: false }],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 0],

            [0, 7, { multiplicity: 2, valid: false }],
            [7, 4, { multiplicity: 2, valid: false }],
            [7, 3, { multiplicity: 2 }],
            [7, 5],
            [1, 3],
        ],
    }
}
