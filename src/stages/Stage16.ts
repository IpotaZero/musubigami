import { GraphData, VertexData } from "../Game/Graph"

export function stage(): GraphData {
    const vertices: VertexData[] = []

    for (let i = 0; i < 5; i++) {
        vertices.push([Math.sin(((i - 1) * 2 * Math.PI) / 5) * 120, 20 - Math.cos(((i - 1) * 2 * Math.PI) / 5) * 120])
    }

    vertices.push([-120, -90], [120, -90])

    return {
        vertices,
        edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4, { arrow: true }],
            [4, 0],

            [0, 2],
            [5, 1],
            [6, 1],
            [6, 2],

            [0, 3, { multiplicity: 3 }],
            [0, 5, { arrow: true, multiplicity: 3 }],
            [0, 6],

            [1, 3],
            [1, 4, { arrow: true }],

            [2, 4],
            [2, 5, { arrow: true }],

            [3, 5, { multiplicity: 2 }],
        ],
        firstIndex: 5,
    }
}
