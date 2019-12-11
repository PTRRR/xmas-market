import { CurveInterpolator } from 'curve-interpolator'
import { getEllipsePoint, morphPoint } from '../../utils'

export function tubeDefault ({ ctx, canvas }) {
  function render () {
    const { width, height } = canvas
    function getRandomPoint () {
      return {
        x: Math.random() * width,
        y: Math.random() * height
      }
    }

    const numPoints = 5
    const targetPoints = []
    for (let i = 0; i < numPoints; i++) {
      const point = getRandomPoint()
      targetPoints.push(point)
    }

    const spline = new CurveInterpolator(targetPoints.map(({ x, y }) => {
      return [x, y]
    }), 0.01)

    const pointsNum = Math.round(spline.length * 0.2)
    const points = spline.getPoints(pointsNum)
    
    for (let i = 1; i < pointsNum; i++) {
      const [lastX, lastY] = points[i - 1]
      const [x, y] = points[i]
      const [nextX, nextY] = points[i + 1]
      
      const ellipseRotation = Math.atan2(y - lastY, x - lastX)
      const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)

      const segments = 100
      for (let j = 0; j < segments; j++) {
        const t = j / segments
        const angle = t * Math.PI * 2
        const rx = 5
        const ry = 100
        const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
        const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
        const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, t)
        ctx.lineTo(segmentX, segmentY)
      }
    }

    ctx.stroke() 
  }

  return {
    render
  }
}
