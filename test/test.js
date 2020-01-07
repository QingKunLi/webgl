
const Vector = require('./vector.js')
const Ray = require('./ray.js')

let a = new Vector(1, 2, 3)
let b = new Vector(4, 5, 6)

console.log(Vector.cross(a, b))