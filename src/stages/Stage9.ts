import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, -100],
        [-150, 100],
        [80, 120],
        [150, 0],
        [80, -120],
        [-80, -50, { switch: true }],
        [-80, 50],
        [40, 70],
        [40, -70],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 0],
            [3, 6],
            [6, 5, { valid: false }],
            [5, 8, { valid: false }],
            [8, 7, { valid: false }],
            [7, 6, { valid: false }],
            [5, 3],
            [5, 0, { multiplicity: 2, arrow: true }],
            [6, 1, { multiplicity: 2, valid: false }],
        ],
    }
}
