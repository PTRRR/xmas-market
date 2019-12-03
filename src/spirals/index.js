import Simplex from 'simplex-noise'
import { clamp, getPointAtLength, getNormalized, getPathLength, getEllipsePoint, morphPoint } from '../utils'

export async function spiral (ctx, width, height) {
  const spiralSize = 20
  const spiralGap = 30
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 1000; i++) {
    const r = Math.tan(i % 2) * (i * 0.031) * 10
    const x = Math.cos(i * 0.1) * r + width * 0.5
    const y = Math.sin(i * 0.1) * r + height * 0.5
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

export async function spiral2 (ctx, width, height) {
  const gui = document.querySelector('.gui')
  const n = document.createElement('input')
  n.setAttribute('type', 'range')
  n.setAttribute('min', '-5')
  n.setAttribute('max', '5')
  n.setAttribute('step', '0.0001')
  gui.appendChild(n)

  const v = document.createElement('input')
  v.setAttribute('type', 'range')
  v.setAttribute('min', '-1')
  v.setAttribute('max', '1')
  v.setAttribute('step', '0.0001')
  gui.appendChild(v)

  n.addEventListener('input', () => {
    draw(n.value, v.value)
  })

  v.addEventListener('input', () => {
    draw(n.value, v.value)
  })

  function draw (val1, val2) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    const spiralSize = 20
    const spiralGap = 30
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let i = 0; i < 1000; i++) {
      const r = Math.sin(i % 100 * val1) * 400 * Math.cos(i * val2)
      const x = Math.cos(i * 0.1) * r + width * 0.5
      const y = Math.sin(i * 0.1) * r + height * 0.5
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }
}

export async function spiral3 (ctx, width, height) {
  const spiralSize = 20
  const spiralGap = 30
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 10000; i++) {
    const r = 30 + Math.sin(i * 0.6) * Math.cos(i * 0.014) * 30 + i * 0.04
    const x = Math.cos(i * 0.045) * r + width * 0.5
    const y = Math.sin(i * 0.045) * r + height * 0.5
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

export async function spiral4 (ctx, width, height) {
  const path = []
  ctx.beginPath()
  const segments = 20000
  for (let i = 0; i < segments; i++) {
    const offsetX = i / segments * width
    const offsetY = i / segments * height
    const r = 30 + Math.sin(i * 0.001 + Math.PI) * 30
    const x = Math.cos(i * 0.2) * r + offsetX
    const y = Math.sin(i * 0.2) * r + height * 0.5 + clamp(Math.tan(i * 0.0015), -7, 7) * 50
    ctx.lineTo(x, y)

    if (i === 0) {
      ctx.moveTo(x, y)
      path.push(x * 10, y * 10, 0)
    }
    path.push(x * 10, y * 10, 1)
  }

  path.push(0, 0, 0)

  ctx.stroke()

  return path
}

export async function spiral5 (ctx, width, height) {
  const spiralSize = 20
  const spiralGap = 30

  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + clamp(Math.sin(i * 0.0004), -6, 6) * 100
    const x = Math.cos(i * 0.1 + Math.sin(i * 0.0001)) * r + width * 0.5
    const y = Math.sin(i * 0.1 + Math.cos(i * 0.0002)) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + clamp(Math.sin(i * 0.0004 + Math.PI *0.5), -6, 6) * 100
    const x = Math.cos(i * 0.1 + Math.sin(i * 0.0001)) * r + width * 0.5 + 150
    const y = Math.sin(i * 0.1 + Math.cos(i * 0.0002 + 10)) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

export async function spiral6 (ctx, width, height) {
  const path = []
  const spiralDefinition = 3000
  const printMult = 8

  const columns = 14
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

export async function spiral7 (ctx, width, height) {
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

export async function spiral8 (ctx, width, height) {
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

export function spiral9 (ctx, width, height) {
  const path = []
  const scale = 13
  const cX = width * 0.5
  const cY = height * 0.5

  
  const iterationSegments = 3000
  const totalSegments = 30000
  for (let i = 0; i < totalSegments; i++) {
    const segmentRadius = i / totalSegments * height * 0.45
    const segmentAngle = (i / iterationSegments) * Math.PI * 2
    const segmentX = Math.cos(segmentAngle) * segmentRadius + cX
    const segmentY = Math.sin(segmentAngle) * segmentRadius + cY

    const segments = 1 / i * 30
    const angle = i * 0.5
    const radius = 20 + Math.sin(i * 0.0000002 * i) * 40
    const x = Math.cos(angle) * radius + segmentX
    const y = Math.sin(angle) * radius + segmentY
    if (i === 0) {
      ctx.moveTo(x, y)
      path.push(x * scale, y * scale, 0)
    }
    ctx.lineTo(x, y)
    path.push(x * scale, y * scale, 1)
  }

  ctx.stroke()

  return path
}

export function spiral10 (ctx, width, height) {
  const spiral = []
  const path = []
  const scale = 13
  const cX = width * 0.5
  const cY = height * 0.5

  const iterationSegments = 300
  const totalSegments = 3000
  for (let i = 0; i < totalSegments; i++) {
    const segmentRadius = i / totalSegments * (height - 120) * 0.5 + 30
    const segmentAngle = i / iterationSegments * Math.PI * 2
    const segmentX = Math.cos(segmentAngle) * segmentRadius + cX
    const segmentY = Math.sin(segmentAngle) * segmentRadius + cY
    spiral.push({ x: segmentX, y: segmentY })
  }

  ctx.stroke()

  const points = 4000
  const step = getPathLength(spiral) / (points + 1)
  ctx.beginPath()
  for (let i = 1; i < points - 1; i++) {
    const { x: lx, y: ly } = getPointAtLength((i - 1) / points, spiral)
    const { x, y } = getPointAtLength(i / points, spiral)
    const { x: nx, y: ny } = getPointAtLength((i + 1) / points, spiral)
    const dir = { x: x - lx, y: y - ly }
    const ellipseRotation = Math.atan2(dir.y, dir.x)

    const nDir = { x: nx - x, y: ny - y }
    const nEllipseRotation = Math.atan2(nDir.y, nDir.x)

    ctx.beginPath()
    const iterations = 20
    for (let j = 0; j < iterations + 1; j++) {
      const percent = j / iterations
      const angle = percent * Math.PI * 2
      const rx = 10
      const ry = (Math.cos(i * 0.2) + 1) * 20 + 3
      const { x: lsx, y: lsy } = getEllipsePoint(lx, ly, rx, ry, angle, ellipseRotation)
      const { x: sx, y: sy } = getEllipsePoint(x, y, rx, ry, angle, nEllipseRotation)
      ctx.lineTo((1 - percent) * lsx + percent * sx, (1 - percent) * lsy + percent * sy)
      path.push(((1 - percent) * lsx + percent * sx) * scale, ((1 - percent) * lsy + percent * sy) * scale, 1)
    }
    ctx.stroke()
  }


  return path
}

export function spiral11 (ctx, width, height) {
  const simplex = new Simplex()
  const origins = 30
  
  for (let i = 0; i < origins; i++) {
    const originX = i / origins * width
    const originY = height

    const trailSegments = 150
    const trainHeight = height

    function getPoint (index) {
      const noiseScale = 0.002
      const noiseAmpitude = 0
      const x = originX
      const y = originY - (index / trailSegments) * trainHeight
      const noise = simplex.noise2D(x * noiseScale, y * noiseScale)
      return { x: x + noise * noiseAmpitude, y: y }
    }

    ctx.beginPath()
    for (let j = 1; j < trailSegments - 1; j++) {
      const { x: lastX, y: lastY } = getPoint(j - 1)
      const { x, y } = getPoint(j)
      const { x: nextX, y: nextY } = getPoint(j + 1)
      const ellipseRotation = Math.atan2(y - lastY, x - lastX)
      const nextEllipseRotation = Math.atan2(nextY - y, nextX - x)
      const noiseScale = 0.0015
      const noise = simplex.noise2D(x * noiseScale, y * noiseScale)
      
      const spiralSegments = 30
      for (let k = 0; k < spiralSegments; k++) {
        const percent = k / spiralSegments
        const angle = percent * Math.PI * 2
        const rx = 1
        const ry = 5 + noise * 50 * k * 0.12
        const lastPoint = getEllipsePoint(lastX, lastY, rx, ry, angle, ellipseRotation)
        const point = getEllipsePoint(x, y, rx, ry, angle, nextEllipseRotation)
        const { x: segmentX, y: segmentY } = morphPoint(lastPoint, point, percent)
        ctx.lineTo(segmentX, segmentY)  
      }
    }
    ctx.stroke()
  }

}