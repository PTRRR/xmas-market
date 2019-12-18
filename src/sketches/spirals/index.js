import Simplex from 'simplex-noise'
import { clamp, getEllipsePoint, morphPoint } from '../../utils'
export * from './tubeDefault'
export * from './tubes'
export * from './fatTube'
export * from './tubesNoise'
export * from './adn'

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
      const r = Math.sin(i * 0.001)
      const size = 30
      const minR = r * size + size + 3
      const x = Math.cos(i * 0.2) * minR + offsetX + 60
      const y = Math.sin(i * 0.2) * minR + height * 0.5 + clamp(Math.tan(i * 0.0012), -height * 0.008, height * 0.008) * 50
      ctx.lineTo(x, y)

      if (i === 0) {
        ctx.moveTo(x, y)
        path.push({ x, y, z: 0, v: 60 })
      }

      path.push({ x, y, z: 1, v: 60 })
    }

    ctx.stroke()
  }

  return {
    render,
    getPath: () => path
  }
}

// export async function Pattern ({ ctx, canvas }) {
//   const spiralDefinition = 3000
//   const printMult = 8
//   const columns = 14
  
//   function render () {
//     const { width, height } = canvas
//     const path = []

//     for (let c = 0; c < columns + 1; c++) {
//       const offsetX = c / columns * width
//       ctx.beginPath()
//       ctx.moveTo(offsetX, 0)
//       path.push({ x: offsetX, y: 0, z: 0, v: 50 })
  
//       for (let j = 0; j < spiralDefinition; j++) {
//         const percent = j / spiralDefinition
//         const offsetY = percent * height
//         const r = 60 * (Math.sin(percent * 20 + (Math.PI * c)) * 0.5 + 0.5)
//         const x = Math.cos(offsetY * 1) * r + offsetX
//         const y = Math.sin(offsetY * 1) * r + offsetY
//         ctx.lineTo(x, y)
//         path.push({ x, y, z: 1, v: 50 })
//       }
  
//       ctx.stroke()
//     }

//     return path
//   }

//   return {
//     render,
//     getPath: () => render()
//   }
// }

export function Liquid ({ ctx, canvas }) {
  const { width, height } = canvas
  let path = []
  const scale = 12.5
  const simplex = new Simplex()
  const origins = 5

  function render () {
    path = []
    for (let i = 0; i < origins; i++) {
      const originX = (i / (origins - 1)) * width * 0.8 + width * 0.1
      const originY = height - 20
  
      const trailSegments = 200
      const trailHeight = height - 30
  
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
        const noiseScale = 0.002
        const noise = simplex.noise2D(x * noiseScale, y * noiseScale) + 1
        
        const spiralSegments = 50
        for (let k = 0; k < spiralSegments; k++) {
          const percent = k / spiralSegments
          const angle = percent * Math.PI * 2
          const rx = 20
          const maxDist = Math.min(originX, width - originX)
          let ry = (noise) * 200
          ry = clamp(ry, 0, maxDist)
          const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
          const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
          let { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, percent)
          ctx.lineTo(segmentX, segmentY)

          segmentX = clamp(segmentX, 0, width)
          
          if (initTrail) {
            path.push({ x: segmentX, y: segmentY, z: 0, v: 80 })
            initTrail = false
          }
  
          path.push({ x: segmentX, y: segmentY, z: 1, v: 80 })
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
