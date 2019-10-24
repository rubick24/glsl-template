import { GlTF } from '../types/glTF'
import parseGLB from './parseGLB'
import getAccessor from './getAccessor'
import getImages from './getImages'

interface IGlTFExpose {
  animations: object[]
  scene: object
  scenes: object[]
  cameras: object[]
  models: object[]
}

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
  let accessors = getAccessor(json, buffers)

  // get images
  let images = getImages(json, buffers)

  // TODO: getMaterials
}
