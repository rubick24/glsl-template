import { GlTF } from '../types/glTF'

import { IAccessor, IPrimitive, IMaterial, IMesh } from './interfaces'
import Shader from '../shader'

export default (
  gl: WebGL2RenderingContext,
  shader: Shader,
  json: GlTF,
  accessors: IAccessor[],
  materials: IMaterial[]
) => {
  if (!json.meshes) {
    throw new Error('glTFLoader: no meshes found')
  }

  return json.meshes.map(mesh => {
    const primitives = mesh.primitives.map(primitive => {
      // if () {
      //   // TODO: support no indices primitive
      //   throw new Error('glTFLoader: primitive.indices is undefined')
      // }
      const vao = gl.createVertexArray()
      const buffer = gl.createBuffer()
      if (primitive.indices === undefined || !vao || !buffer) {
        throw new Error('glTFLoader: can not create vao or buffer')
      }
      gl.bindVertexArray(vao)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
      const accessor = accessors[primitive.indices]
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, accessor.bufferData, gl.STATIC_DRAW)

      if (!primitive.material) {
        throw new Error('glTFLoader: no default material')
      }
      const material = materials[primitive.material]

      // const attributes = Object.keys(primitive.attributes)
      const attributes = ['POSITION', 'NORMAL', 'TANGENT', 'TEXCOORD_0']

      attributes.forEach(k => {
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        const accessor = accessors[primitive.attributes[k]]
        gl.bufferData(gl.ARRAY_BUFFER, accessor.bufferData, gl.STATIC_DRAW)
        const attrLocation = gl.getAttribLocation(shader.program, 'a_' + k)
        gl.vertexAttribPointer(attrLocation, accessor.itemSize, accessor.componentType, false, 0, 0)
        gl.enableVertexAttribArray(attrLocation)
      })
      gl.bindVertexArray(null)
      return {
        indices: {
          accessor,
          buffer
        },
        vao,
        material,
        mode: primitive.mode === undefined ? 4 : primitive.mode
      } as IPrimitive
    })
    return { primitives } as IMesh
  })
}
