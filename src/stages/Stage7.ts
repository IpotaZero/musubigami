import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, -100],
        [-150, 100],
        [150, 100],
        [150, -100],
        [-50, -50],
        [-50, 50],
        [50, 50],
        [50, -50],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [0, 3],
            [0, 4],
            [1, 2],
            [6, 2, { multiplicity: 1, arrow: true }],
            [2, 7],
            [2, 3],
            [3, 7],
            [4, 5, { multiplicity: 3, arrow: true }],
            [4, 7, { multiplicity: 2 }],
            [5, 6, { multiplicity: 3 }],
            [5, 1, { multiplicity: 2, arrow: true }],
            [6, 7, { multiplicity: 2 }],
        ],
    }
}
