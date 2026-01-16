import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-160, 120],
        [-100, 120],
        [0, 120],
        [0, 30],
        [160, 120],
        [160, -60],
        [0, -60],
        [-100, -60, { life: 8 }],
        [-100, -120],
        [-160, -60],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 9],
            [1, 2],
            [1, 3, { multiplicity: 2 }],
            [1, 7, { multiplicity: 2, arrow: true }],
            [3, 4],
            [3, 6],
            [4, 5],
            [5, 6],
            [6, 7, { multiplicity: 2 }],
            [7, 8],
            [7, 9],
        ],
    }
}
