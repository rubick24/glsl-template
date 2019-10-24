import { GlTF } from '../types/glTF'

const typeSize = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}
const componentTypedArray = {
  [WebGL2RenderingContext.BYTE]: Int8Array,
  [WebGL2RenderingContext.UNSIGNED_BYTE]: Uint8Array,
  [WebGL2RenderingContext.SHORT]: Int16Array,
  [WebGL2RenderingContext.UNSIGNED_SHORT]: Uint16Array,
  [WebGL2RenderingContext.UNSIGNED_INT]: Uint32Array,
  [WebGL2RenderingContext.FLOAT]: Float32Array
}

// json.accessors.map((v, i) => getAccessor(json, buffers, i))
export default (json: GlTF, buffers: ArrayBuffer[]): IAccessor[] => {
  if (!json.accessors || !json.bufferViews) {
    throw new Error('glTFLoader: no accessors or bufferViews')
  }
  const accessorsTemp = json.accessors
  const bufferViewsTemp = json.bufferViews
  return accessorsTemp.map((v, i) => {
    const accessor = accessorsTemp[i]
    const itemSize = typeSize[accessor.type as GLType]
    const bufferView = bufferViewsTemp[accessor.bufferView as number]
    const bufferIndex = bufferView.buffer
    const arrayType = componentTypedArray[accessor.componentType]
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)
    return {
      index: i,
      itemSize,
      bufferData: new arrayType(
        buffers[bufferIndex],
        byteOffset, // offset of byte
        itemSize * accessor.count // length of element
      )
    }
  })
}
