const canvas = document.getElementById('main') as HTMLCanvasElement
canvas.height = window.innerHeight
canvas.width = window.innerWidth
const gl = canvas.getContext('webgl2', { premultipliedAlpha: false })
if (!gl) {
  throw new Error('webgl2 not available')
}
gl.viewport(0, 0, canvas.width, canvas.height)

// shader.setUniform('iResolution', 'VEC2', [canvas.clientWidth, canvas.clientHeight])
// const handleGlobalClick = (e: MouseEvent) => {
//   shader.setUniform('iMouse', 'VEC2', [e.clientX, e.clientY])
// }
// window.addEventListener('click', handleGlobalClick)

gl.clearColor(0, 0, 0, 0)
const renderLoop = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  if (window.innerHeight !== canvas.height || window.innerWidth !== canvas.width) {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
    // shader.setUniform('iResolution', 'VEC2', [canvas.clientWidth, canvas.clientHeight])
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  requestAnimationFrame(renderLoop)
}
renderLoop(0)
