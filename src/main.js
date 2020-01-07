
import Vector from './vector.js'
import Ray from './ray.js'
import Camera from './camera.js'
import { Sphere, Lambertian, Metal, Dielectric } from './sphere.js'

// vertex shader
const VSHADER_SOURCE = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    varying vec4 vColor;
    void main() {
        gl_Position = aPosition;
        gl_PointSize = 1.0;
        vColor = aColor;
    }
`

// fragment shader
const FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`

const main = function() {
    const canvas = document.querySelector('#canvas')
    const gl = getWebGLContext(canvas)

    // 初始化着色器 
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to init the shader!')
        return -1
    }

    // 创建顶点缓冲
    const n = initVertexBuffer(gl)

    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.DEPTH_TEST)
    // 清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, n)
}

const initVertexBuffer = function(gl) {
    // 设置相机
    const camera = new Camera(new Vector(0, 0, 0))

    // 设置场景中物体
    let obj = []
    obj.push(new Sphere(new Vector(0, 0, -1), 0.25, new Lambertian(new Vector(0.1, 0.2, 0.5)))) // 粗糙小球
    obj.push(new Sphere(new Vector(0.5, 0, -1), 0.25, new Metal(new Vector(0.8, 0.6, 0.2)))) // 金属小球1
    obj.push(new Sphere(new Vector(-0.5, 0, -1), 0.25, new Dielectric(1.5))) // 透明小球
    obj.push(new Sphere(new Vector(-0.5, 0, -1), -0.225, new Dielectric(1.5)))
    obj.push(new Sphere(new Vector(0, -100.25, -1), 100, new Lambertian(new Vector(0.8, 0.8, 0)))) // 底座

    // 设置屏幕上点的坐标及颜色
    let vertices = []
    let colors = []
    let nx = 400, ny = 400, ns = 2
    let dx = 2 / nx, dy = 2 / ny
    let left = -1, bottom = -1
    for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
            let pos = new Vector(left + i * dx, bottom + j * dy, -1)
            let color = new Vector(0, 0, 0)
            // 去除边界锯齿
            for (let k = 0; k < ns; k++) {
                let pos_t = new Vector(pos.x + Math.sin(Math.PI*2*k/ns) * dx, pos.y + Math.sin(Math.PI*2*k/ns) * dy, pos.z)
                let ray = camera.getRay(pos_t)
                color = color.add(calColor(ray, obj, 0))
            }
            color = color.divide(ns)
            color = new Vector(Math.sqrt(color.x), Math.sqrt(color.y), Math.sqrt(color.z))  // 提高颜色亮度
            vertices.push(pos)
            colors.push(color)
        }
    }

    const n = vertices.length
    // vector转换为数组
    vertices = unzip(vertices)
    colors = unzip(colors)

    // 创建顶点缓冲
    initArrayBuffer(gl, 'aPosition', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'aColor', colors, 3, gl.FLOAT)
    return n
}

const initArrayBuffer = function(gl, name, values, length, type) {
    // 创建缓冲区
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW)

    // 变量赋值
    const attrib = gl.getAttribLocation(gl.program, name)
    gl.vertexAttribPointer(attrib, length, type, false, 0, 0)
    gl.enableVertexAttribArray(attrib)
}

const unzip = function(values) {
    let array = []
    for(let item of values) {
        array.push(...item.getValue())
    }
    return new Float32Array(array)
}

// 计算光线与物体是否有碰撞
const hitable = function(ray, obj) {
    let hitHistory = null
    let tMax = Infinity
    for (let item of obj) {
        let hitResult = item.hit(ray, 0.001, tMax)
        if (hitResult) {
            tMax = hitResult.t 
            hitHistory = hitResult
        }
    }
    return hitHistory
}

// 计算反射
function calColor(ray, obj, depth) {
    let hitHistory = hitable(ray, obj)  // 判断光线与物体是否有碰撞
    if (hitHistory) {
        // 得到反射结果
        const scattered = hitHistory.material.scatter(ray, hitHistory)
        // 50次反射以内
        if (scattered && depth < 50) {
            // 计算下一次反射的颜色
            let color = calColor(scattered.ray, obj, depth+1)
            return color.multiply(scattered.attenuation)
        } else {
            // 反射次数过多, 认为光已经完全衰减
            return new Vector(0, 0, 0)
        }
    } else {
        // 没有发生碰撞则为背景天空色
        const unitRay = Vector.normalize(ray.direction)
        const f = (unitRay.y + 1) * 0.5 // [0, 1]
        return (new Vector(1, 1, 1)).multiply(1 - f).add((new Vector(0.5, 0.7, 1)).multiply(f))
        // return new Vector(1, 1, 1) // 背景为白色
    }
}

main()