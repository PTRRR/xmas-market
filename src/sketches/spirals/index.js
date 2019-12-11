import Simplex from 'simplex-noise'
import { clamp, getPointAtLength, getNormalized, getPerpendicular, getPathLength, getEllipsePoint, morphPoint } from '../../utils'
export * from './tubes'

export async function Spin ({ ctx, canvas }) {
  let path = []
  function render () {
    const { width, height } = canvas
    path = []

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    ctx.beginPath()
    const segments = 30000
    for (let i = 0; i < segments; i++) {
      const offsetX = i / segments * (width - 120)
      const offsetY = i / segments * height
      const r = 30 + Math.sin(i * 0.001) * 30
      const x = Math.cos(i * 0.2) * r + offsetX + 60
      const y = Math.sin(i * 0.2) * r + height * 0.5 + clamp(Math.tan(i * 0.0012), -height * 0.008, height * 0.008) * 50
      ctx.lineTo(x, y)

      if (i === 0) {
        ctx.moveTo(x, y)
        path.push(x, y, 0)
      }

      path.push(x, y, 1)
    }

    ctx.stroke()
  }

  return {
    render,
    getPath: () => path
  }
}

export async function Pattern ({ ctx, canvas }) {
  const spiralDefinition = 3000
  const printMult = 8
  const columns = 14
  
  function render () {
    const { width, height } = canvas
    const path = []

    for (let c = 0; c < columns + 1; c++) {
      const offsetX = c / columns * width
      ctx.beginPath()
      ctx.moveTo(offsetX, 0)
      path.push(offsetX * printMult, 0, 0)
  
      for (let j = 0; j < spiralDefinition; j++) {
        const percent = j / spiralDefinition
        const offsetY = percent * height
        const r = 60 * (Math.sin(percent * 20 + (Math.PI * c)) * 0.5 + 0.5)
        const x = Math.cos(offsetY * 1) * r + offsetX
        const y = Math.sin(offsetY * 1) * r + offsetY
        ctx.lineTo(x, y)
        path.push(x * printMult, y * printMult, 1)
      }
  
      ctx.stroke()
    }

    return path
  }

  return {
    render,
    getPath: () => render()
  }
}

export async function Pattern2 ({ ctx, canvas }) {
  const { width, height } = canvas
  var simplex = new Simplex()
  const path = []
  const spiralDefinition = 3000
  const printMult = 10

  const columns = 5
  for (let c = 0; c < columns + 1; c++) {
    const offsetX = c / columns * width
    ctx.beginPath()
    ctx.moveTo(offsetX, 0)
    path.push(offsetX * printMult, 0, 0)

    for (let j = 0; j < spiralDefinition; j++) {
      const percent = j / spiralDefinition
      const offsetY = percent * height
      const noise = simplex.noise2D(c * 0.004, offsetY * 0.003)
      const r = 60 * (Math.sin(percent * 20 + (Math.PI * c)) * 0.5 + 0.5) + 10
      const x = Math.cos(offsetY * 1) * r + offsetX + noise * 100
      const y = Math.sin(offsetY * 1) * r + offsetY
      ctx.lineTo(x, y)
      path.push(x * printMult, y * printMult, 1)
    }

    ctx.stroke()
  }

  return path
}

export function Mountains ({ ctx, canvas }) {
  const { width, height } = canvas
  let path = []
  const scale = 12.5
  const simplex = new Simplex()
  const origins = 15

  function render () {
    path = []
    for (let i = 0; i < origins; i++) {
      const originX = (i / (origins - 1)) * width
      const originY = height
  
      const trailSegments = 200
      const trailHeight = height
  
      function getPoint (index) {
        const noiseScale = 0.002
        const noiseAmpitude = 0
        const x = originX
        const y = originY - (index / trailSegments) * trailHeight
        const noise = simplex.noise2D(x * noiseScale, y * noiseScale)
        return { x: x + noise * noiseAmpitude, y: y }
      }
  
      ctx.beginPath()
      let initTrail = true
      for (let j = 1; j < trailSegments - 1; j++) {
        const { x: lastX, y: lastY } = getPoint(j - 1)
        const { x, y } = getPoint(j)
        const { x: nextX, y: nextY } = getPoint(j + 1)
        const ellipseRotation = Math.atan2(y - lastY, x - lastX)
        const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)
        const noiseScale = 0.0015
        const noise = simplex.noise2D(x * noiseScale, y * noiseScale)
        
        const spiralSegments = 40
        for (let k = 0; k < spiralSegments; k++) {
          const percent = k / spiralSegments
          const angle = percent * Math.PI * 2
          const rx = 5
          const ry = (noise) * 20 * k * 0.5
          const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
          const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
          const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, percent)
          ctx.lineTo(segmentX, segmentY)
          
          if (initTrail) {
            path.push(segmentX * scale, segmentY * scale, 0)
            initTrail = false
          }
  
          path.push(segmentX * scale, segmentY * scale, 1)
        }
      }
      ctx.stroke()
    }
  }

  return {
    render,
    getPath: () => path
  }
}
