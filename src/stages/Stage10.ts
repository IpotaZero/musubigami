import { GraphData, VertexData } from "../Game/Graph"
import { vec } from "../utils/Vec"

export function stage(): GraphData {
    const vertices: VertexData[] = []

    const T = 2 * Math.PI

    for (let i = 0; i < 3; i++) {
        vertices.push(
            vec
                .arg((T / 3) * i + T / 4)
                .scaled(130)
                .plus(vec(0, -20)).l,
        )
    }

    for (let i = 0; i < 3; i++) {
        vertices.push([
            ...vec
                .arg((T / 3) * i + T / 4 + T / 2)
                .scaled(65)
                .plus(vec(0, -20)).l,
            { switch: true },
        ])
    }

    return {
        vertices,
        edges: [
            [1, 5],
            [5, 0],
            [0, 4],
            [4, 2],
            [2, 3],
            [3, 1],

            [3, 5, { multiplicity: 2, valid: false }],
            [5, 4, { valid: false }],
            [4, 3, { valid: false }],
        ],
    }
}
