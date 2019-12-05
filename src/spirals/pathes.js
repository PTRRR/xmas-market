import { CurveInterpolator } from 'curve-interpolator'
import { getEllipsePoint, morphPoint } from '../utils'
import simplify from 'simplify-path'
import Simplex from 'simplex-noise'

export function tube1 (ctx, width, height) {
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

export function tube2 (ctx, width, height, onDraw) {
  const scale = 13
  const simplex = new Simplex()
  let clicked = false
  let path = []
  const pathes = []
  let pathToDraw = []

  window.addEventListener('mousedown', () => {
    clicked = true
  })

  window.addEventListener('touchstart', () => {
    clicked = true
  })

  window.addEventListener('mousemove', event => {
    if (clicked) {
      const { clientX: x, clientY: y } = event
      const point = { x, y }
      path.push(point)
      drawTubes(pathes)
      drawPath(path)
    }
  })

  window.addEventListener('touchmove', event => {
    if (clicked) {
      const { touches } = event
      const [{ clientX: x, clientY: y }] = touches
      const point = { x, y }
      path.push(point)
      drawTubes(pathes)
      drawPath(path)
    }
  })

  window.addEventListener('mouseup', () => {
    clicked = false
    pathes.push(path)
    drawTubes(pathes)
    path = []
  })

  window.addEventListener('touchend', () => {
    clicked = false
    pathes.push(path)
    drawTubes(pathes)
    path = []
  })

  function drawPath (path) {
    ctx.beginPath()
    for (const { x, y } of path) {
      ctx.lineTo(x, y)
    }
    ctx.stroke()    
  }

  function drawTubes (pathes) {
    pathToDraw = []
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    
    for (const path of pathes) {
      let started = false
      const simplifiedPath = simplify(path.map(({ x, y }) => {
        return [x, y]
      }), 30)

      const spline = new CurveInterpolator(simplifiedPath, 0.01)
    
      const pointsNum = Math.round(spline.length * 0.2)
      const points = spline.getPoints(pointsNum)
      
      ctx.beginPath()
      for (let i = 1; i < pointsNum; i++) {
        const [lastX, lastY] = points[i - 1]
        const [x, y] = points[i]
        const [nextX, nextY] = points[i + 1]
        
        const ellipseRotation = Math.atan2(y - lastY, x - lastX)
        const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)
        const noise = simplex.noise2D(i * 0.01, i * 0.01)
    
        const segments = 10
        for (let j = 0; j < segments; j++) {
          const t = j / segments
          const angle = t * Math.PI * 2 + i * 0.004 
          const rx = 50
          const ry = 300
          const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
          const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
          const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, t)
          ctx.lineTo(segmentX, segmentY)
          
          if (!started) {
            pathToDraw.push(segmentX * scale, segmentY * scale, 0)
            started = true
          }
          pathToDraw.push(segmentX * scale, segmentY * scale, 1)
        }
      }
    
      ctx.stroke()
    }

    if (onDraw) {
      onDraw(pathToDraw)
    }
  }

  return pathToDraw
}