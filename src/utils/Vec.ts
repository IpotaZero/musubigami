export const vec = (x: number, y: number) => {
    return new Vec(x, y)
}

vec.arg = (radian: number) => vec(Math.cos(radian), Math.sin(radian))

export class Vec {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    get l(): [number, number] {
        return [this.x, this.y]
    }

    // 不変
    plus(v: Vec) {
        return vec(this.x + v.x, this.y + v.y)
    }

    minus(v: Vec) {
        return vec(this.x - v.x, this.y - v.y)
    }

    scaled(scalar: number) {
        return vec(this.x * scalar, this.y * scalar)
    }

    normalized() {
        const l = this.magnitude()

        if (l == 0) {
            return vec(0, 0)
        } else {
            return this.scaled(1 / l)
        }
    }

    rotated(radian: number) {
        return vec(
            this.x * Math.cos(radian) - this.y * Math.sin(radian),
            this.x * Math.sin(radian) + this.y * Math.cos(radian),
        )
    }

    normal() {
        const n = this.normalized()
        return vec(n.y, -n.x)
    }

    clone() {
        return vec(this.x, this.y)
    }

    // 変更
    add(v: Vec) {
        this.x += v.x
        this.y += v.y
    }

    sub(v: Vec) {
        this.x -= v.x
        this.y -= v.y
    }

    scale(scalar: number) {
        this.x *= scalar
        this.y *= scalar
    }

    rotate(radian: number) {
        const x = this.x * Math.cos(radian) - this.y * Math.sin(radian)
        const y = this.x * Math.sin(radian) + this.y * Math.cos(radian)

        this.x = x
        this.y = y
    }

    normalize() {
        const l = this.magnitude()

        if (l == 0) return
        this.x /= l
        this.y /= l
    }

    // スカラー
    magnitude() {
        return Math.hypot(this.x, this.y)
    }

    dot(v: Vec) {
        return this.x * v.x + this.y * v.y
    }

    cross(v: Vec) {
        return this.x * v.y - v.x * this.y
    }

    arg() {
        return Math.atan2(this.y, this.x)
    }
}
