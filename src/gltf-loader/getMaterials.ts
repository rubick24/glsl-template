import { GlTF } from '../types/glTF'
import { IMaterial } from './interfaces'
import getTextures from './getTextures'

export default (gl: WebGL2RenderingContext, json: GlTF, images: HTMLImageElement[]) => {
  if (!json.materials) {
    return []
  }

  return json.materials.map(material => {
    const uniforms = []
    const textureIndexes = []

    // 只支持unlit
    if (
      !material.extensions ||
      !material.extensions.KHR_materials_unlit ||
      !material.pbrMetallicRoughness
    ) {
      throw new Error('glTFLoader: only support KHR_materials_unlit now')
    }
    const mr = material.pbrMetallicRoughness
    uniforms.push({
      name: 'u_BaseColorFactor',
      type: 'VEC4',
      value: mr.baseColorFactor || [0.5, 0.5, 0.5]
    })

    if (mr.baseColorTexture) {
      textureIndexes.push(mr.baseColorTexture)
      uniforms.push({
        name: 'u_BaseColorSampler',
        type: 'INT',
        value: textureIndexes.length - 1
      })
    }

    const textures = textureIndexes.map((v, i) => getTextures(gl, json, images, v.index, i))
    return {
      uniforms,
      textures
    } as IMaterial
  })
}
