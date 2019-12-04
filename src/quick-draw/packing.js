import { loadTextFile } from '../utils'
import angelsURL from './datas/full_simplified_angel.ndjson'
import candleURL from './datas/full_simplified_candle.ndjson'
import snowflakeURL from './datas/full_simplified_snowflake.ndjson'
import snowmanURL from './datas/full_simplified_snowman.ndjson'

function parseNDJSON (ndjson) {
  return ndjson
    .split('\n')
    .map(it => JSON.parse(`[${it}]`)[0])
}

export async function packing (ctx, width, height) {
  const points = []
  const snowflakeNDJSON = await loadTextFile(angelsURL)
  const snowflakes = parseNDJSON(snowflakeNDJSON)

  function drawRandomDrawing (array, offsetX, offsetY, radius) {
    const randomIndex = Math.floor(Math.random() * array.length)
    const { drawing } = array[randomIndex]

    for (const path of drawing) {
      const [xCoords, yCoords] = path
      const nX = xCoords[0] / 266 * (radius * 2) + offsetX - radius
      const nY = yCoords[0] / 266 * (radius * 2) + offsetY - radius

      const mult = 13
      points.push(nX * mult, nY * mult, 0)
      points.push(nX * mult, nY * mult, 1)
      
      ctx.beginPath()
      ctx.moveTo(nX, nY)

      let lastNX = null
      let lastNY = null
      for (let i = 1; i < xCoords.length; i++) {
        const nX = xCoords[i] / 266 * (radius * 2) + offsetX - radius
        const nY = yCoords[i] / 266 * (radius * 2) + offsetY - radius
        lastNX = nX
        lastNY = nY
        points.push(nX * mult, nY * mult, 1)
        ctx.lineTo(nX, nY)
      }

      points.push(lastNX * mult, lastNY * mult, 0)

      ctx.stroke()
    }
  }

  function getDist (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }

  function intersects (drawing, drawings) {
    return drawings.reduce((intersects, currentDrawing) => {
      const { x, y, radius } = currentDrawing
      const dist = getDist(x, y, drawing.x, drawing.y) - radius
      if (dist && dist < 0) intersects = true
      return intersects
    }, false)
  } 

  function getClosestDrawing (drawing, drawings) {
    let minDist = Infinity
    let closestDrawing = null
    for (const currentDrawing of drawings) {
      const { x, y, radius } = currentDrawing
      const dist = getDist(x, y, drawing.x, drawing.y) - radius
      if (dist > 0 && minDist > dist) {
        minDist = dist
        closestDrawing = { dist, ...currentDrawing }
      }
    }
    return closestDrawing
  }

  function d () {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    const numDrawings = 200
    const drawings = []

    for (let i = 0; i < numDrawings; i++) {
      const offset = 0.2
      const x = width * offset + Math.random() * width * (1 - offset * 2)
      const y = height * offset + Math.random() * height * (1 - offset * 2)
      const radius = Math.random() * 100 + 50
  
      const drawing = { x, y }
      const closestDrawing = getClosestDrawing(drawing, drawings)
      
      ctx.beginPath()
      if (!intersects(drawing, drawings) && closestDrawing) {
        const { dist } = closestDrawing
        const maxRadius = Math.min(dist, radius)
        drawRandomDrawing(snowflakes, x, y, maxRadius)
        drawing.radius = maxRadius
      } else if (drawings.length === 0) {
        drawRandomDrawing(snowflakes, x, y, radius)
        drawing.radius = radius
      }
      
      drawings.push(drawing)
    }
  }

  d()

  console.log(points)

  return points
}