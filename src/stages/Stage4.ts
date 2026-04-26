import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [0, -100],
        [-150, -60],
        [0, 30],
        [-150, 60],
        [0, 100],
        [150, 60],
        [150, -60],
        [0, -30],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 6],
            [0, 7],
            [1, 2],
            [2, 3],
            [2, 5],
            [2, 6],
            [2, 7],
            [3, 4],
            [3, 5, { multiplicity: 2 }],
            [4, 5],
        ],
        firstIndex: 0,
    }
}
