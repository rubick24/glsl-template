export default async (src: string) => {
  const img = new Image()
  img.src = src
  await new Promise(resolve => (img.onload = resolve))
  const imageData = (() => {
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, c.width, c.height)
  })()

  const tw = imageData.width - 1
  const th = imageData.height - 1
  const ow = imageData.width
  const verticesBuffer = new Float32Array(tw * th * 2 * 3 * 3) // 64x64 grid 2 triangles 3 points 3 vertices
  for (let i = 0; i < tw; i++) {
    for (let j = 0; j < th; j++) {
      // p(i, j)
      // triangle 1
      verticesBuffer[(j * tw + i) * 6 * 3 + 0] = i
      verticesBuffer[(j * tw + i) * 6 * 3 + 1] = imageData.data[(j * ow + i) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 2] = j

      verticesBuffer[(j * tw + i) * 6 * 3 + 3] = i
      verticesBuffer[(j * tw + i) * 6 * 3 + 4] = imageData.data[((j + 1) * ow + i) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 5] = j + 1

      verticesBuffer[(j * tw + i) * 6 * 3 + 6] = i + 1
      verticesBuffer[(j * tw + i) * 6 * 3 + 7] = imageData.data[(j * ow + (i + 1)) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 8] = j
      // triangle 2
      verticesBuffer[(j * tw + i) * 6 * 3 + 9] = i
      verticesBuffer[(j * tw + i) * 6 * 3 + 10] = imageData.data[((j + 1) * ow + i) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 11] = j + 1

      verticesBuffer[(j * tw + i) * 6 * 3 + 12] = i + 1
      verticesBuffer[(j * tw + i) * 6 * 3 + 13] =
        imageData.data[((j + 1) * ow + (i + 1)) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 14] = j + 1

      verticesBuffer[(j * tw + i) * 6 * 3 + 15] = i + 1
      verticesBuffer[(j * tw + i) * 6 * 3 + 16] = imageData.data[(j * ow + (i + 1)) * 4 + 0] / 255
      verticesBuffer[(j * tw + i) * 6 * 3 + 17] = j
    }
  }

  return {
    verticesCount: tw * th * 2 * 3,
    vertices: verticesBuffer
  }
}
