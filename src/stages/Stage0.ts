import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [0, -80],

        [-65, -120],
        [-130, -100],
        [-130, 0],
        [-65, 75],

        [0, 120],

        [65, 75],
        [130, 0],
        [130, -100],
        [65, -120],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 6],
            [6, 7],
            [7, 8],
            [8, 9],
            [9, 0],
        ],
    }
}
