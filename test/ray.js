
class Ray {
    constructor(origin, direction) {
        this.origin = origin
        this.direction = direction
    }
    line(t) {
        return this.origin.add(this.direction.multiply(t))
    } 
}

module.exports = Ray