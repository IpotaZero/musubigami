import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [0, -80, { switch: true }],

        [-65, -120],
        [-130, -100],
        [-130, 0],
        [-65, 75],

        [0, 120, { switch: true }],

        [65, 75],
        [130, 0],
        [130, -100],
        [65, -120],

        [0, 0],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [3, 2],
            [3, 4],
            [5, 4, { arrow: true }],
            [5, 6, { valid: false }],
            [6, 7, { valid: false }],
            [7, 8, { valid: false }],
            [8, 9, { valid: false }],
            [9, 0, { valid: false }],

            [0, 10, { valid: false }],
            [10, 5, { valid: false }],

            [0, 3, { valid: false }],
            [4, 10, { valid: false }],
            [3, 10, { valid: false }],
            [4, 0, { valid: false }],

            [8, 0, { arrow: true }],
            [10, 7],
            [7, 0, { arrow: true }],
            [10, 8],

            [2, 10, { multiplicity: 2, arrow: true }],
            [10, 6, { multiplicity: 2, arrow: true, valid: false }],
        ],
    }
}
