import { GlTF } from '../types/glTF'
import parseGLB from './parseGLB'
import getAccessor from './getAccessor'
import getImages from './getImages'
import getMeshes from './getMeshes'

import Shader from '../shader'
import vsSource from './shader/m.vert'
import fsSource from './shader/m.frag'
import getMaterials from './getMaterials'

// interface IGlTFExpose {
//   scene: object
//   meshes: object[]
//   animations?: object[]
//   scenes?: object[]
//   cameras?: object[]
// }

const relativeURL = (base: string, target: string) => {
  if (base.lastIndexOf('/') !== -1) {
    return base.slice(0, base.lastIndexOf('/')) + '/' + target
  } else {
    return target
  }
}
const loadGLTF = async (url: string, gl: WebGL2RenderingContext) => {
  // get json and buffers
  let extension: string
  let json: GlTF
  let buffers: ArrayBuffer[]
  if (/\.gltf$/.test(url)) {
    extension = 'gltf'
    json = (await fetch(url).then(res => res.json())) as GlTF
    if (!json.buffers) {
      throw new Error('glTFLoader: no buffer specified in gltf file')
    }
    buffers = await Promise.all(
      json.buffers.map(buffer => {
        if (!buffer.uri) {
          throw new Error('glTFLoader: buffer.uri not specified')
        }
        const binURL = relativeURL(url, buffer.uri)
        return fetch(binURL).then(res => res.arrayBuffer())
      })
    )
  } else if (/\.glb$/.test(url)) {
    extension = 'gltf'
    const r = await parseGLB(url)
    json = r[0]
    buffers = r[1]
  } else {
    throw new Error('glTFLoader: file suffix not support')
  }

  // get accessors
  const accessors = getAccessor(json, buffers)

  // get images
  const images = await getImages(json, buffers)

  // TODO: getMaterials
  // use default unlit material now
  const materials = getMaterials(gl, json, images)

  const shader = new Shader(gl, vsSource, fsSource)

  const meshes = getMeshes(gl, shader, json, accessors, materials)
  // render(scene)
  // draw(meshes[0], modelMatrix)

  // animate(animations[0], )
}
