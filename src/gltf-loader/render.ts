import { IScene, INode } from './interfaces'
import draw from './draw'
import { mat4 } from 'gl-matrix'


const firstModelMatrix = mat4.create() as Float32Array

export default (
  gl: WebGL2RenderingContext,
  scene: IScene
) => {
  if (!scene.nodes) {
    return
  }

  let viewMatrix: Float32Array
  let projectionMatrix: Float32Array
  let cameraPosition: Float32Array

  const renderNode = (node: INode, modelMatrix: Float32Array) => {
    mat4.mul(node.tempMatrix, modelMatrix, node.matrix)
    if (node.mesh) {
      draw(gl, node.mesh, node.tempMatrix, viewMatrix, projectionMatrix, cameraPosition)
    }
    if (node.children) {
      node.children.forEach(child => {
        renderNode(child, node.tempMatrix)
      })
    }
  }

  scene.nodes.forEach(node => {
    renderNode(node, firstModelMatrix)
  })
}
