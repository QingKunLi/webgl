
class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
    add(v) {
        let x = this.x + v.x
        let y = this.y + v.y
        let z = this.z + v.z
        return new Vector(x, y, z)
    }
    minus(v) {
        let x = this.x - v.x
        let y = this.y - v.y
        let z = this.z - v.z
        return new Vector(x, y, z)
    }
    multiply(v) {
        let x, y, z
        if (v instanceof Vector) {
            x = this.x * v.x
            y = this.y * v.y
            z = this.z * v.z
        } else {
            x = this.x * v
            y = this.y * v
            z = this.z * v
        }
        return new Vector(x, y, z)
    }
    divide(v) {
        let x, y, z
        if (v instanceof Vector) {
            x = this.x / v.x
            y = this.y / v.y
            z = this.z / v.z
        } else {
            x = this.x / v
            y = this.y / v
            z = this.z / v
        }
        return new Vector(x, y, z)
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    getValue() {
        return [this.x, this.y, this.z]
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
    }
    static normalize(v) {
        return v.divide(v.length())
    }
    static cross(v1, v2) {
        // 计算叉积
        const x = v1.y*v2.z - v1.z*v2.y
        const y = v1.z*v2.x  - v1.x*v2.z
        const z = v1.x*v2.y - v1.y*v2.x
        return new Vector(x, y, z)
    }
}

module.exports = Vector
