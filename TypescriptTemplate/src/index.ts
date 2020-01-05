import * as THREE from 'three'
import RenderEngine from './core/RenderEngine'
import './styles/index.css'

RenderEngine.init()

var geometry = new THREE.BoxGeometry(1, 1, 1)
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
var cube = new THREE.Mesh(geometry, material)

RenderEngine.scene().add(cube)
