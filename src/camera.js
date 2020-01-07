
import Ray from './ray.js'
import Vector from './vector.js'

export default class Camera {
    constructor(lookfrom, lookat, vup, vfov, aspect) {
        // lookfrom 即为相机所在的点
        this.origin = lookfrom
        // lookat 为相机看向的点，定义了与投影屏幕垂直的方向
        const w = Vector.normalize(lookat.minus(lookfrom))
        // w 和 vup的叉积定义了投影平面的u方向
        const u = Vector.normalize(Vector.cross(w, vup))
        // u 和 w的叉积定义了投影平面的v方向
        const v = Vector.normalize(Vector.cross(u, w))
        // vfov 为相机垂直方向视张角
        // aspect 为相机定义水平方向
        const theta = vfov * Math.PI / 180
        const half_height = Math.tan(theta/2) //相机能看到的高度
        const half_width = half_height * aspect // 相机能看到的宽度
        this.lower_left_corner = this.origin.minus(u.multiply(half_width)).minus(v.multiply(half_height)).add(w) // 相机看到的最低点
        this.vertical = v.multiply(2*half_height)
        this.horizontal = u.multiply(2*half_width)
    }
    getRay(s, t) {
        return new Ray(this.origin, this.lower_left_corner.add(this.horizontal.multiply(s)).add(this.vertical.multiply(t)).minus(this.origin))
    }
}