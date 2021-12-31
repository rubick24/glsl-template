import ArcRotateCamera from './camera/ArcRotateCamera'
import DesktopInput from './input/DesktopInput'
import TouchInput from './input/TouchInput'
import { vec3, mat4 } from 'gl-matrix'
import Shader from './shader'
import vsSource from './shader/main.vert'
import fsSource from './shader/main.frag'
import genMesh from './genDepthMesh'

const canvas = document.getElementById('main') as HTMLCanvasElement
canvas.width = 800
canvas.height = 600
const gl = canvas.getContext('webgl2', { premultipliedAlpha: false })
if (!gl) {
  throw new Error('webgl2 not available')
}
gl.viewport(0, 0, canvas.width, canvas.height)
gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)

const camera = new ArcRotateCamera(vec3.fromValues(0, 0, 0), Math.PI / 2, Math.PI / 2, 10)
const di = new DesktopInput(canvas)
const ti = new TouchInput(canvas)

const shader = new Shader({ gl, vs: vsSource, fs: fsSource })
shader.use()

const depthMesh = await genMesh('64_64.png')

// const vertices = new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0])
const vao = gl.createVertexArray()
const vbo = gl.createBuffer()
gl.bindVertexArray(vao)
gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
gl.bufferData(gl.ARRAY_BUFFER, depthMesh.vertices, gl.STATIC_DRAW)
gl.enableVertexAttribArray(0)
gl.vertexAttribPointer(0, 3, gl.FLOAT, true, 12, 0)
gl.bindBuffer(gl.ARRAY_BUFFER, null)
// gl.bindVertexArray(null)

shader.setUniform('resolution', 'VEC2', [canvas.clientWidth, canvas.clientHeight])
const handleGlobalClick = (e: MouseEvent) => {
  shader.setUniform('mouse', 'VEC2', [e.clientX, e.clientY])
}
window.addEventListener('click', handleGlobalClick)

// const projectionMatrix = camera.getProjectionMatrix(gl.canvas.width / gl.canvas.height, 0.1, 1000)
shader.setUniform('fovY', 'FLOAT', Math.PI / 4)

// const texture = gl.createTexture()
// gl.activeTexture(gl.TEXTURE0)
// gl.bindTexture(gl.TEXTURE_2D, texture)
// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT)
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT)
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST)
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST)

const projectionMatrix = camera.getProjectionMatrix(gl.canvas.width / gl.canvas.height, 0.01, 1000)
const mvp = mat4.create()
const modelMatrix = mat4.create()
gl.clearColor(0, 0, 0, 0)
shader.setUniform('resolution', 'VEC2', [canvas.width, canvas.height])

mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1])
mat4.translate(modelMatrix, modelMatrix, [-32, 0, -32])

const renderLoop = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  camera.processDesktopInput(di)
  camera.processTouchInput(ti)
  shader.setUniform('time', 'FLOAT', time)

  mat4.mul(mvp, camera.viewMatrix, modelMatrix)
  mat4.mul(mvp, projectionMatrix, mvp)
  shader.setUniform('mvp_matrix', 'MAT4', mvp)
  gl.drawArrays(gl.TRIANGLES, 0, depthMesh.verticesCount)
  requestAnimationFrame(renderLoop)
}
requestAnimationFrame(renderLoop)
