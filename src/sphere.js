
import Vector from './vector.js'
import Ray from './ray.js'

class Sphere {
    constructor(center, r, color, material) {
        this.center = center
        this.r = r
        this.color = color
        this.material = material
    }
    hit(ray, tMin=0, tMax=Infinity) {
        const oc = ray.origin.minus(this.center)
        const a = Vector.dot(ray.direction, ray.direction)
        const b = Vector.dot(ray.direction, oc)
        const c = Vector.dot(oc, oc) - this.r * this.r
        const delta = b * b - a * c
        if (delta > 0) {
            let t = (-b - Math.sqrt(delta)) / a
            let hitHistory = {}
            if (t < tMax && t > tMin) {
                hitHistory.t = t
                hitHistory.point = ray.line(t)
                hitHistory.normal = hitHistory.point.minus(this.center).divide(this.r)
                hitHistory.material = this.material
                hitHistory.color = this.color
                return hitHistory
            }
            t = (-b + Math.sqrt(delta)) / a
            if (t < tMax && t > tMin) {
                hitHistory.t = t
                hitHistory.point = ray.line(t)
                hitHistory.normal = hitHistory.point.minus(this.center).divide(this.r)
                hitHistory.material = this.material
                hitHistory.color = this.color
                return hitHistory
            }
        }
        return null
    }
}

// 选取球体内随机一点
const randomInUnitSphere = function() {
    let s
    do {
        s = (new Vector(Math.random(), Math.random(), Math.random())).multiply(2.0).minus(new Vector(1, 1, 1)) // 选取单位立方体内的一点
    } while(s.length >= 1) // 若该点超出球外，重新选取
    return s
}

const reflect = function(v, normal) {
    return v.minus(normal.multiply(Vector.dot(v, normal)).multiply(2))
}

// 折射
const refract = function(v, normal, ni) {
    const uv = Vector.normalize(v)
    // ni为比折射率
    const vproj = Vector.dot(uv, normal) // 入射光线在法向量方向的投影 夹角cos
    // 判断是否发生全反射
    const delta = 1 - ni * ni * (1 - vproj * vproj)
    let refracted = null
    if (delta > 0) {
        // 没有发生全反射
        refracted = uv.minus(normal.multiply(vproj)).multiply(ni).minus(normal.multiply(Math.sqrt(delta)))
    }
    return refracted
}

// 反射率随着入射光和法线方向的夹角而变化
const schlick = function(cosine, ri) {
    let r0 = (1 - ri) / (1 + ri)
    r0 = r0 * r0
    return r0 + (1 - r0) * Math.pow((1 - cosine), 5)
}


// 朗伯体 （表面漫反射)
class Lambertian {
    constructor(a) {
        this.albedo = a  // 材料表面反射率
    }
    scatter(ray, hitHistory) {
        // 随机散射点s
        const s = hitHistory.point.add(hitHistory.normal).add(randomInUnitSphere())
        // 散射结果
        let scattered = {}
        scattered.ray = new Ray(hitHistory.point, s.minus(hitHistory.point))  // 散射后光线
        scattered.attenuation = this.albedo  // 反照率
        return scattered
    }
}

// 金属 (表面镜面反射)
class Metal {
    constructor(a, fuzz=0) {
        this.albedo = a
        this.fuzz = fuzz
    }
    scatter(ray, hitHistory) {
        // 计算镜面反射方向
        let reflected = reflect(ray.direction, hitHistory.normal)
        const s = randomInUnitSphere()
        reflected = reflected.add(s.multiply(this.fuzz)) // 给金属加上不透明度

        if (Vector.dot(reflected, hitHistory.normal) > 0) {
            // 散射结果
            let scattered = {}
            scattered.ray = new Ray(hitHistory.point, reflected)
            scattered.attenuation = this.albedo
            return scattered
        }
        return null
    }
}

// 透明物体 (发生折射)
class Dielectric {
    constructor(ri) {
        this.ri = ri
    }
    scatter(ray, hitHistory) {
        const reflected = reflect(ray.direction, hitHistory.normal)
        let ni, cosine, outwardNormal
        if (Vector.dot(ray.direction, hitHistory.normal) > 0) {
            outwardNormal = hitHistory.normal.multiply(-1)
            ni = this.ri 
            cosine = Vector.dot(Vector.normalize(ray.direction), hitHistory.normal) * this.ri
        } else {
            outwardNormal = hitHistory.normal
            ni = 1 / this.ri
            cosine = -Vector.dot(Vector.normalize(ray.direction), hitHistory.normal)
        }
        // 计算折射情况
        const refracted = refract(ray.direction, outwardNormal, ni)
        let scattered = {}
        let reflect_prob
        scattered.attenuation = new Vector(1, 1, 1)
        if (refracted) {
            reflect_prob = schlick(cosine, this.ri)
        } else {
            scattered.ray = new Ray(hitHistory.point, reflected) // 全反射的情况
            reflect_prob = 1.0
        }
        if (Math.random() < reflect_prob) {
            scattered.ray = new Ray(hitHistory.point, reflected)
        } else {
            scattered.ray = new Ray(hitHistory.point, refracted)
        }
        return scattered
    }
}

export { Sphere, Lambertian, Metal, Dielectric } 