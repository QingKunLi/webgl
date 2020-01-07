
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
        gl_PointSize = 0.5;
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
    const camera = new Camera(new Vector(0, 0, 2), new Vector(0, 0, -1), new Vector(0, 1, 0), 90, 1)

    // 设置场景中物体
    let r = Math.cos(Math.PI/4)
    let obj = []
    const leftWall = new Sphere(new Vector(-1000-50, 0, -1), 1000, new Vector(1, 0, 0), new Lambertian(new Vector(0.75, 0.75, 0.75))) // left
    const rightWall = new Sphere(new Vector(1000+50, 0, -1), 1000, new Vector(0, 0, 1), new Lambertian(new Vector(0.75, 0.75, 0.75)))  // right
    const topWall = new Sphere(new Vector(0, 1000+50, -1), 1000, new Vector(1, 1, 1), new Lambertian(new Vector(0.75, 0.75, 0.75))) // top
    const bottomWall = new Sphere(new Vector(0, -1000-0.5, -1), 1000, new Vector(1, 1, 1), new Lambertian(new Vector(0.75, 0.75, 0.75))) // bottom
    // const frontWall = new Sphere(new Vector(0, 0, -1e5-5), 1e5, new Vector(1, 0, 0), new Lambertian(new Vector(1, 1, 1))) // front
    // obj.push(new Sphere(new Vector(0, 0, -1), 0.5, new Vector(1, 1, 1), new Lambertian(new Vector(0.1, 0.2, 0.5))))
    obj.push(new Sphere(new Vector(-1, 0, -1), 0.5, new Vector(1, 1, 1), new Metal(new Vector(1, 1, 1))))
    obj.push(new Sphere(new Vector(1, 0, -1), 0.5, new Vector(1, 1, 1), new Dielectric(1.5)))
    // obj.push(new Sphere(new Vector(1, 0, -1), -0.45, new Dielectric(1.5)))
    obj.push(leftWall)
    obj.push(rightWall)
    obj.push(topWall)
    obj.push(bottomWall)
    // obj.push(rightWall)
    // obj.push(frontWall)
    // 设置屏幕上点的坐标及颜色
    let vertices = []
    let colors = []
    let nx = 400, ny = 400, ns = 4
    let dx = 2 / nx, dy = 2 / ny
    let left = -1, bottom = -1
    for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
            let pos = new Vector(left + i * dx, bottom + j * dy, -1)
            let color = new Vector(0, 0, 0)
            let u = i / nx, v = j / ny
            for (let s = 0; s < ns; s++) {
                let ru = u + Math.sin(Math.PI*2*s/ns) * 1 / nx
                let rv = v + Math.cos(Math.PI*2*s/ns) * 1 / ny
                let ray = camera.getRay(u, v)
                color = color.add(calColor(ray, obj, 0))
            }
            // let ray = camera.getRay(u, v)
            // color = calColor(ray, obj, 0)
            color = Vector.normalize(color.divide(ns))
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
        if (scattered && depth < 5) {
            // 计算下一次反射的颜色
            let color = calColor(scattered.ray, obj, depth+1)
            return color.multiply(scattered.attenuation).multiply(hitHistory.color)
        } else {
            // 反射次数过多, 认为光已经完全衰减
            return new Vector(0, 0, 0)
        }
    } else {
        // // 没有发生碰撞则为背景天空色
        // const unitRay = Vector.normalize(ray.direction)
        // const f = (unitRay.y + 1) * 0.5 // [0, 1]
        // return (new Vector(1, 1, 1)).multiply(1 - f).add((new Vector(0.5, 0.7, 1)).multiply(f))
        return new Vector(1, 1, 1) // 背景为白色
    }
}

main()