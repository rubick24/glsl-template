import ArcRotateCamera from './camera/ArcRotateCamera'
// import DesktopInput from './input/DesktopInput'
// import TouchInput from './input/TouchInput'
import { vec3, mat4 } from 'gl-matrix'
import Shader from './shader'
import vsSource from './shader/main.vert'
import fsSource from './shader/main.frag'
import TinySDF from './tinySdf'
;(async () => {
  const drawImageData = (imageData: ImageData, scale: number = 1) => {
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    canvas.style.width = canvas.width * scale + 'px'
    canvas.style.height = canvas.height * scale + 'px'
    canvas.style.imageRendering = 'pixelated'
    const ctx = canvas.getContext('2d')
    ctx?.putImageData(imageData, 0, 0)
    document.body.appendChild(canvas)
  }

  // const imageData = await (async () => {
  //   const image = await new Promise<HTMLImageElement>(r => {
  //     const img = new Image()
  //     img.onload = () => r(img)
  //     img.src = '/test.png'
  //   })

  //   const canvas = document.createElement('canvas')
  //   canvas.width = image.naturalWidth
  //   canvas.height = image.naturalHeight
  //   const context = canvas.getContext('2d')
  //   if (!context) {
  //     throw new Error('failed to get context')
  //   }
  //   context.drawImage(image, 0, 0)
  //   return context.getImageData(0, 0, canvas.width, canvas.height) as ImageData
  // })()

  const imageData = (() => {
    const tinySdf = new TinySDF({
      fontSize: 64,
      fontFamily: 'sans-serif',
      cutoff: 0.5,
      radius: 40
    })
    const d = tinySdf.draw('A')
    console.log('sdf', d.width, d.height)
    const imageData = new ImageData(d.width, d.height)
    for (let i = 0; i < d.data.length; i++) {
      imageData.data[i * 4 + 0] = d.data[i]
      imageData.data[i * 4 + 1] = d.data[i]
      imageData.data[i * 4 + 2] = d.data[i]
      imageData.data[i * 4 + 3] = 255
    }
    return imageData
  })()

  const scale = 8
  drawImageData(imageData, scale)

  const canvas = document.getElementById('main') as HTMLCanvasElement
  canvas.width = imageData.width * scale
  canvas.height = imageData.height * scale
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'

  const download = document.createElement('button')
  download.innerText = 'Download'
  download.addEventListener('click', () => {
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    console.log(canvas.width, canvas.height)
    a.download = 'test.png'
    a.click()
  })
  document.body.appendChild(download)

  const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true })
  if (!gl) {
    throw new Error('webgl2 not available')
  }
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  const camera = new ArcRotateCamera(vec3.fromValues(0, 0, 0), Math.PI / 2, Math.PI / 2, 3)
  // const di = new DesktopInput(canvas)
  // const ti = new TouchInput(canvas)

  const shader = new Shader({ gl, vs: vsSource, fs: fsSource })
  shader.use()
  const quad = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0]
  const quadVAO = gl.createVertexArray()
  const quadVBO = gl.createBuffer()
  gl.bindVertexArray(quadVAO)
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, true, 8, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  // gl.bindVertexArray(null)

  shader.setUniform('resolution', 'VEC2', [canvas.clientWidth, canvas.clientHeight])
  const handleGlobalClick = (e: MouseEvent) => {
    shader.setUniform('mouse', 'VEC2', [e.clientX, e.clientY])
  }
  window.addEventListener('click', handleGlobalClick)

  // const projectionMatrix = camera.getProjectionMatrix(gl.canvas.width / gl.canvas.height, 0.1, 1000)
  shader.setUniform('fovY', 'FLOAT', Math.PI / 4)

  const viewMatrixInverse = mat4.create()

  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const level = 0
  const internalFormat = gl.RGBA
  const width = imageData.width
  const height = imageData.height
  const border = 0
  const format = gl.RGBA
  const type = gl.UNSIGNED_BYTE
  const data = imageData
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR)

  gl.clearColor(0, 0, 0, 0)
  const renderLoop = (time: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // if (window.innerHeight !== canvas.height || window.innerWidth !== canvas.width) {
    //   canvas.height = window.innerHeight
    //   canvas.width = window.innerWidth
    //   shader.setUniform('resolution', 'VEC2', [canvas.clientWidth, canvas.clientHeight])
    //   gl.viewport(0, 0, canvas.width, canvas.height)
    // }
    // camera.processDesktopInput(di)
    // camera.processTouchInput(ti)
    // gl.activeTexture(gl.TEXTURE0)
    // gl.bindTexture(gl.TEXTURE_2D, texture)
    shader.setUniform('textTexture', 'INT', 0)
    shader.setUniform('time', 'FLOAT', time)
    shader.setUniform('cameraPosition', 'VEC3', camera.position)
    shader.setUniform(
      'viewMatrixInverse',
      'MAT4',
      mat4.invert(viewMatrixInverse, camera.viewMatrix)
    )
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(renderLoop)
  }
  requestAnimationFrame(renderLoop)
})()
