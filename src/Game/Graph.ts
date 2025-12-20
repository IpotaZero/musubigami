export type VertexData = [x: number, y: number, option?: { switch?: boolean; life?: number }]
export type EdgeData = [from: number, to: number, option?: { multiplicity?: number; arrow?: boolean; valid?: boolean }]

export type GraphData = {
    vertices: VertexData[]
    edges: EdgeData[]
}

export const SVG_NS = "http://www.w3.org/2000/svg"
