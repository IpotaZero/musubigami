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
        edges: [[0, 1, { valid: false }]],
    }
}
