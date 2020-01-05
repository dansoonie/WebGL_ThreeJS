import * as THREE from 'three'
import InteractionControls from './InteractionControls'

export default class RenderEngine {
  private static instance: RenderEngine
  private static interactionControls: InteractionControls

  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
  private scene: THREE.Scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera

  private renderRequested: boolean
  private rendering: boolean
  private lastRenderTime: number

  static init() {
    this.instance = new RenderEngine()
    this.interactionControls = new InteractionControls()
  }

  static renderer() {
    if (!this.instance) throw Error('RenderEngine not initialized')
    return this.instance.renderer
  }

  static scene() {
    if (!this.instance) throw Error('RenderEngine not initialized')
    return this.instance.scene
  }

  static camera() {
    if (!this.instance) throw Error('RenderEngine not initialized')
    return this.instance.camera
  }

  static requestRender() {
    if (!this.instance) throw Error('RenderEngine not initialized')
    this.instance.requestRender()
  }

  private constructor() {
    // setup camera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100)

    // setup renderer
    this.renderRequested = false
    this.rendering = false
    this.lastRenderTime = 0
    this.resizeRenderer(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', () => {
      this.resizeRenderer(window.innerWidth, window.innerHeight)
    })
    this.camera.position.setZ(10)
    document.body.append(this.renderer.domElement)
    this.requestRender()
  }

  private resizeRenderer(width: number, height: number): void {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.requestRender()
  }

  private render(): void {
    if (this.renderRequested) {
      const currentTime = new Date().getTime()
      if (this.lastRenderTime) {
        const dt = currentTime - this.lastRenderTime
        console.info(`Render dt: ${dt}`)
      }
      this.lastRenderTime = currentTime
      this.rendering = true
      this.renderRequested = false
      requestAnimationFrame(() => {
        this.render()
      })
      this.renderer.render(this.scene, this.camera)
    } else {
      this.rendering = false
      console.info('Stopping continuous rendering')
    }
  }

  requestRender(): void {
    this.renderRequested = true
    if (!this.rendering) {
      console.info('Start continuous rendering')
      this.render()
    }
  }
}