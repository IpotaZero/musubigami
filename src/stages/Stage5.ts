import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = Array.from({ length: 5 }, (_, i) => [
        Math.sin((i * (2 * Math.PI)) / 5) * 120,
        -Math.cos((i * (2 * Math.PI)) / 5) * 120,
    ])

    return {
        vertices,
        edges: [
            [0, 1, { multiplicity: 1, arrow: true }],
            [1, 2, { multiplicity: 1, arrow: true }],
            [2, 3, { multiplicity: 1, arrow: true }],
            [3, 4, { multiplicity: 1, arrow: true }],
            [4, 0, { multiplicity: 1, arrow: true }],

            [4, 1, { multiplicity: 1, arrow: true }],
        ],
    }
}
