import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = [
        [-150, 0, { life: 5 }],
        [-75, 0],
        [0, 0, { switch: true }],
        [75, 0],
        [150, -80],
        [150, 80],
        [0, -80],
    ]

    return {
        vertices,
        edges: [
            [0, 1, { multiplicity: 2, valid: false }],
            [1, 2, { multiplicity: 2, valid: false }],
            [2, 3, { multiplicity: 2 }],
            [3, 4],
            [3, 5],
            [4, 6],
        ],
    }
}
