import snowflakeURL from './datas/full_simplified_snowflake.ndjson'
import angelsURL from './datas/full_simplified_angel.ndjson'
import { loadTextFile } from '../utils'

function parseNDJSON (ndjson) {
  return ndjson
    .split('\n')
    .map(it => JSON.parse(`[${it}]`)[0])
}

export async function repetition (ctx, width, height) {
  return new Promise(async resolve => {
    const snowflakeNDJSON = await loadTextFile(angelsURL)
    const snowflakes = parseNDJSON(snowflakeNDJSON)

    function normalizePoint (x, y, scale) {
      return [
        (x / 255 - 0.5) * scale + width * 0.5,
        (y / 255 - 0.5) * scale + height * 0.5
      ]
    }
    
    function draw () {
      const fullPath = []
      const randomIndex = Math.floor(Math.random() * snowflakes.length)
      const { drawing } = snowflakes[randomIndex]

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < 50; i++) {
        const radius = (i + 100) * 100
        for (const path of drawing) {
          ctx.beginPath()
          const [xCoords, yCoords] = path
          let [nX, nY] = normalizePoint(xCoords[0], yCoords[0], radius)
          
          fullPath.push(nX, nY, 0)
          for (let i = 1; i < xCoords.length; i++) {
            [nX, nY] = normalizePoint(xCoords[i], yCoords[i], radius)
            ctx.lineTo(nX, nY)
            fullPath.push(nX, nY, 1)
          }

          fullPath.push(nX, nY, 0)
          ctx.stroke()
        }
      }

      return fullPath
    }

    resolve(draw())
  })
}