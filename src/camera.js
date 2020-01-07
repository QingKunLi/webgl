
import Ray from './ray.js'

export default class Camera {
    constructor(origin, vfov, aspect) {
        this.origin = origin
        // vfov 为相机垂直方向视张角
        // aspect 为相机定义水平方向
        const theta = vfov * Math.PI / 180
        const half_height = Math.tan(vfov) //相机能看到的高度
        const half_width = half_height * aspect // 相机能看到的宽度
    }
    getRay(pos) {
        return new Ray(this.origin, pos.minus(this.origin))
    }
}