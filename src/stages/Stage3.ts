import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [0, -100],
        [-150, -50],
        [150, -50],
        [-150, 100],
        [150, 100],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 2],
            [1, 2, { multiplicity: 3 }],
            [1, 3],
            [1, 4],
            [2, 3],
            [3, 4],
        ],
    }
}
