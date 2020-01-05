import * as THREE from 'three'
import RenderEngine from './RenderEngine'

export default class InteractionControls extends THREE.EventDispatcher {
  private canvas: HTMLCanvasElement
  private camera: THREE.Camera
  private objects: THREE.Object3D[]

  private plane: THREE.Plane = new THREE.Plane()
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()
  private offset: THREE.Vector3 = new THREE.Vector3()
  private intersection: THREE.Vector3 = new THREE.Vector3()
  private worldPosition: THREE.Vector3 = new THREE.Vector3()
  private inverseMatrix: THREE.Matrix4 = new THREE.Matrix4()

  private selected: THREE.Object3D | null = null
  private hovered: THREE.Object3D | null = null

  constructor() {
    super()
    this.canvas = RenderEngine.renderer().domElement
    this.camera = RenderEngine.camera()
    this.objects = RenderEngine.scene().children
    this.activate()
  }

  activate() {
    this.canvas.addEventListener( 'mousemove', this.onMouseMove, false );
		this.canvas.addEventListener( 'mousedown', this.onMouseDown, false );
		this.canvas.addEventListener( 'mouseup', this.onMouseCancel, false );
		this.canvas.addEventListener( 'mouseleave', this.onMouseCancel, false );
  }

  deactivate() {
    this.canvas.removeEventListener( 'mousemove', this.onMouseMove, false );
		this.canvas.removeEventListener( 'mousedown', this.onMouseDown, false );
		this.canvas.removeEventListener( 'mouseup', this.onMouseCancel, false );
		this.canvas.removeEventListener( 'mouseleave', this.onMouseCancel, false );
  }

  dispose() {
    this.deactivate()
  }

  private onMouseMove = (e: MouseEvent): void => {
    //console.log('onMouseMove')
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()

    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    if (this.selected) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.selected.position.copy(this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix))
        RenderEngine.requestRender()
      }
      this.dispatchEvent({ type: 'drag', object: this.selected })
      return
    }
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.objects, true)
    if (intersects.length > 0) {
      const object = intersects[0].object
      this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(object.matrixWorld))
      if (this.hovered !== object) {
        this.hovered = object
        this.dispatchEvent({ type: 'hoveron', object: this.hovered })
        this.canvas.style.cursor = 'pointer'

      }
    } else {
      if (this.hovered) {
        this.dispatchEvent({ type: 'hoveroff', object: this.hovered })
        this.canvas.style.cursor = 'auto'
        this.hovered = null
      }
    }
  }

  private onMouseDown = (e: MouseEvent): void => {
    //console.log('onMouseDown')
    e.preventDefault()
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.objects, true)
    if (intersects.length > 0) {
      this.selected = intersects[0].object
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection) && this.selected) {
        this.inverseMatrix.getInverse(this.selected.parent!.matrixWorld)
        this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld))
      }
      this.canvas.style.cursor = 'move'
      this.dispatchEvent({ type: 'dragestart', object: this.selected })
    }
  }

  private onMouseCancel = (e: MouseEvent): void => {
    //console.log('onMouseCancel')
    e.preventDefault()
    if (this.selected) {
      this.dispatchEvent({ type: 'dragend', object: this.selected })
      this.selected = null
    }
    this.canvas.style.cursor = this.hovered? 'pointer' : 'auto'
  }
}