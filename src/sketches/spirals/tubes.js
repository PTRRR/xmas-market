import Simplex from 'simplex-noise'
import simplify from 'simplify-path'
import { CurveInterpolator } from 'curve-interpolator'
import { getEllipsePoint, morphPoint } from '../../utils'

export function tubes ({ canvas, ctx, events }) {
  const simplex = new Simplex()
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

    for (const path of pathes) {
      if (path.length > 0) {
        let started = false

        const mappedPath = path.map(point => {
          const { x, y } = scalePoint(point, width, height)
          return [x, y]
        })

        const simplifiedPath = simplify(mappedPath, 10)
        const spline = new CurveInterpolator(simplifiedPath, 0.01)
      
        const pointsNum = Math.round(spline.length * 0.33)
        const points = spline.getPoints(pointsNum)
        
        ctx.beginPath()
        for (let i = 1; i < pointsNum; i++) {
          const [lastX, lastY] = points[i - 1]
          const [x, y] = points[i]
          const [nextX, nextY] = points[i + 1]
          
          const ellipseRotation = Math.atan2(y - lastY, x - lastX)
          const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)
          const noise = simplex.noise2D(i * 0.01, i * 0.1)
      
          const segments = 50
          for (let j = 0; j < segments; j++) {
            const t = j / segments
            const angle = t * Math.PI * 2 + i * 0.004 
            const rx = 25
            const ry = width * 0.05
            const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
            const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
            const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, t)
            ctx.lineTo(segmentX, segmentY)
            
            if (!started) {
              fullPath.push({ x: segmentX, y: segmentY, z: 0, v: 70 })
              started = true
            }
            fullPath.push({ x: segmentX, y: segmentY, z: 1, v: 70 })
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