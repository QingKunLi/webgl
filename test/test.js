
const Vector = require('./vector.js')
const Ray = require('./ray.js')

let a = new Vector(1, 2, 3)
let b = new Vector(4, 5, 6)

let origin = new Vector(0, 0, 0)
let dir = new Vector(1, 1, 0)
let ray = new Ray(origin, dir)

console.log(ray.line(0.7))
console.log(ray.direction.divide(ray.direction.length()))