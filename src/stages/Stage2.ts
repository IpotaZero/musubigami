import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, 0],
        [-50, 0],
        [0, -100],
        [0, 100],
        [50, 0],
        [150, 0],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 4],
            [2, 5],
            [3, 4],
            [3, 5],
            [4, 5],
        ],
    }
}
