export async function loadTextFile (file) {
  return new Promise(resolve => {
    const rawFile = new XMLHttpRequest()
    rawFile.open("GET", file, false)
    rawFile.onreadystatechange = function () {
      if(rawFile.readyState === 4) {
        if(rawFile.status === 200 || rawFile.status == 0) {
          const allText = rawFile.responseText
          resolve(allText)
        }
      }
    }
    rawFile.send(null)
  })
}

export function getChunks (data, itemLength, chunkSize) {
  const maxChunkSize = itemLength * chunkSize
  const chunks = []
  let chunk = []
  
  for (let i = 0; i < data.length; i += 3) {
    if (chunk.length >= maxChunkSize) {
      chunks.push(chunk)
      chunk = []
    }

    chunk.push(data[i], data[i + 1], data[i + 2])
  }

  chunks.push(chunk)
  return chunks
}

export function clamp (val, min, max) {
  return Math.min(Math.max(val, min), max)
} 

export function getDist (point1, point2) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
}

export function getNormalized (point) {
  const length = getDist({ x: 0, y: 0 }, point)
  return { x: point.x / length, y: point.y / length }
}

export function getPathLength (path) {
  let length = 0
  for (let i = 1; i < path.length; i++) {
    const lastPoint = path[i - 1]
    const point = path[i]
    const dist = getDist(lastPoint, point)
    length += dist
  }

  return length
}

export function getPointAtLength (length, path) {
  const totalLength = getPathLength(path)
  const targetLength = clamp(length, 0, 1) * totalLength
  let currentLength = 0

  for (let i = 1; i < path.length; i++) {
    const lastPoint = path[i - 1]
    const point = path[i]
    const dist = getDist(lastPoint, point)

    if (currentLength + dist >= targetLength) {
      const delta = targetLength - currentLength
      const dir = getNormalized({ x: point.x - lastPoint.x, y: point.y - lastPoint.y })
      return { x: lastPoint.x + dir.x * delta, y: lastPoint.y + dir.y * delta }
    } else {
      currentLength += dist
    }
  }
}

export function getEllipsePoint (cx, cy, rx, ry, angle, ellipseRotation = 0) {
  return {
    x: rx * Math.cos(angle) * Math.cos(ellipseRotation) - ry * Math.sin(angle) * Math.sin(ellipseRotation) + cx,
    y: rx * Math.cos(angle) * Math.sin(ellipseRotation) + ry * Math.sin(angle) * Math.cos(ellipseRotation) + cy
  }
}

export function morphPoint (point1, point2, amplitude) {
  return {
    x: point1.x * (1 - amplitude) + point2.x * amplitude,
    y: point1.y * (1 - amplitude) + point2.y * amplitude
  }
} 