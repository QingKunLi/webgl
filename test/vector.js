
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
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    getValue() {
        return [this.x, this.y, this.z]
    }
}

module.exports = Vector

