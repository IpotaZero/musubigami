import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, 0],
        [-100, -100],
        [150, -100, { life: 6 }],
        [150, 0],
        [150, 100],
        [0, 0],
        [0, 100],
        [-100, 100],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5, { arrow: true }],
            [3, 5],
            [5, 6],
            [5, 1],
            [5, 7],
            [1, 7, { multiplicity: 3, arrow: true }],
            [7, 0],
            [7, 6],
            [6, 3, { arrow: true }],
            [2, 5, { multiplicity: 2 }],
        ],
    }
}
