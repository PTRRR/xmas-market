import Simplex from 'simplex-noise'
import simplify from 'simplify-path'
import { CurveInterpolator } from 'curve-interpolator'
import { getEllipsePoint, morphPoint } from '../../utils'

export function smallTubes ({ canvas, ctx, events }) {
  const randomSeed = Math.random()
  let clicked = false
  let path = []
  const pathes = []
  let fullPath = []

  events.onDown(() => {
    clicked = true
  })

  events.onMove(event => {
    if (clicked) {
      const { x, y } = event
      const { width, height } = canvas
      
      path.push({
        x: x / width,
        y: y / height
      })

      drawPath(path)
    }
  })

  events.onUp(() => {
    clicked = false
    pathes.push(path)
    path = []
    render()
  })

  function drawPath (path) {
    const { width, height } = canvas
    ctx.beginPath()
    for (const point of path) {
      const { x, y } = scalePoint(point, width, height)
      ctx.lineTo(x, y)
    }
    ctx.stroke()  
  }

  function scalePoint(point, width, height) {
    const { x, y } = point
    return { x: x * width, y: y * height }
  }

  function render () {
    fullPath = []
    const { width, height } = canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    let index = 0
    for (const path of pathes) {
      index++
      const seed = index
      const simplex = new Simplex(index + randomSeed)
      if (path.length > 0) {
        let started = false

        const mappedPath = path.map(point => {
          const { x, y } = scalePoint(point, width, height)
          return [x, y]
        })

        const simplifiedPath = simplify(mappedPath, 10)
        // simplifiedPath.pop()
        // simplifiedPath.shift()
        const spline = new CurveInterpolator(simplifiedPath, 0.01)
      
        const pointsNum = Math.round(spline.length * 0.3)
        const points = spline.getPoints(pointsNum)
        
        ctx.beginPath()
        for (let i = 1; i < pointsNum; i++) {
          const [lastX, lastY] = points[i - 1]
          const [x, y] = points[i]
          const [nextX, nextY] = points[i + 1]
          
          const ellipseRotation = Math.atan2(y - lastY, x - lastX)
          const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)
          
          const noiseSize = 0.005

          const noise = (simplex.noise2D((i + seed) * noiseSize, (i + seed) * noiseSize))
          const rx = 20
          const ry = noise * 400

          const nextNoise = (simplex.noise2D((i + 1 + seed) * noiseSize, (i + 1 + seed) * noiseSize)) * 0.5
          const nextRx = Math.max(5, nextNoise * 15)
          const nextRy = Math.max(5, nextNoise * 300)

          const segments = 50
          for (let j = 0; j < segments; j++) {
            const t = j / segments
            const angle = t * Math.PI * 2 + i * 0.004 
            const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
            const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
            const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, t)
            ctx.lineTo(segmentX, segmentY)
            
            if (!started) {
              fullPath.push(segmentX, segmentY, 0)
              started = true
            }
            fullPath.push(segmentX, segmentY, 1)
          }
        }

        ctx.stroke()
      }
    }
  }

  return {
    render,
    getPath: () => fullPath
  }
}