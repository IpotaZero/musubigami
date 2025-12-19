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
            [3, 4],
            [4, 0],

            [0, 2],
            [5, 0],
            [5, 1],
            [6, 1],
            [6, 2],
        ],
    }
}
