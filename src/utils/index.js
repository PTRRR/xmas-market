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