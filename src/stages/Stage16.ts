import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-100, -100],
        [100, -100],
        [100, 100],
        [-100, 100],
        [0, 0, { switch: true }],
    ]

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],

            [0, 4, { multiplicity: 2 }],
            [1, 4, { multiplicity: 2 }],
            [2, 4, { multiplicity: 2 }],
            [3, 4, { multiplicity: 2 }],
        ],
    }
}
