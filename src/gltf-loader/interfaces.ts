export interface IAccessor {
  index: number
  itemSize: number
  count: number
  componentType: number
  bufferData: GLArrayType
}

export interface IMaterial {
  uniforms: {
    name: string
    type: 'BOOLEAN' | 'INT' | 'FLOAT' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4'
    value: any
  }[]
  textures: WebGLTexture[]
}

export interface IPrimitive {
  indices: {
    accessor: IAccessor
    buffer: WebGLBuffer
  }
  vao: WebGLVertexArrayObject
  material: IMaterial
  mode: number
}

export interface IMesh {
  primitives: IPrimitive[]
}

export const typeSize = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}

export const componentTypedArray = {
  [WebGL2RenderingContext.BYTE]: Int8Array,
  [WebGL2RenderingContext.UNSIGNED_BYTE]: Uint8Array,
  [WebGL2RenderingContext.SHORT]: Int16Array,
  [WebGL2RenderingContext.UNSIGNED_SHORT]: Uint16Array,
  [WebGL2RenderingContext.UNSIGNED_INT]: Uint32Array,
  [WebGL2RenderingContext.FLOAT]: Float32Array
}
