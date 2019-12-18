import axios from 'axios'
import font from './fonts/mdr.json'
import sketches from './sketches'
import { capitalCase } from 'change-case'
import { getChunks, sign, clamp } from './utils'
const { NODE_ENV } = process.env
const DEV_SKETCH = 'Liquid'

const { hostname } = window.location
const port = 8080

const socket = axios.create({
  baseURL: `http://${hostname}:${port}`,
  timeout: 5000
})



async function initialize () {
  const { data: serverConfig } = await socket.get('/config')
  const { ebbConfig } = serverConfig
  const { maxWidth, maxHeight } = ebbConfig
  const drawingArea = { width: 290, height: 225 }
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  let scaling = 0

  function updateCanvas (canvas, options) {
    const { width: canvasWidth, height: canvasHeight } = canvas
    const { width, height } = options
    const { innerWidth, innerHeight } = window
    const ratio = width / height
    const windowRatio = innerWidth / innerHeight
  
    if (ratio > windowRatio) {
      canvas.width = innerWidth
      canvas.height = innerWidth / ratio
      canvas.style.width = "100%"
      canvas.style.height = "initial"
      scaling = width / canvasWidth
    } else {
      canvas.width = innerHeight * ratio
      canvas.height = innerHeight
      canvas.style.width = "initial"
      canvas.style.height = "100%"
      scaling = height / canvasHeight
    }
  }

  function renderSketchInstance (sketchInstance) {
    if (sketchInstance) {
      const { width, height } = canvas
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      sketchInstance.render()
    }
  }

  updateCanvas(canvas, drawingArea)
  window.addEventListener('resize', () => {
    updateCanvas(canvas, drawingArea)
    renderSketchInstance(sketchInstance)
  })

  let sketchInstance = null
  let sketch = null
  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')
  const print = document.querySelector('.print')
  const stop = document.querySelector('.stop')
  const reset = document.querySelector('.reset')

  nav.addEventListener('click', event => {
    event.stopPropagation()
    menu.classList.toggle('menu--show')
  })

  print.addEventListener('click', async event => {
    event.stopPropagation()
    if (sketchInstance) {
      document.body.classList.add('is-printing')

      const { width: canvasWidth, height: canvasHeight } = canvas
      const { width, height } = drawingArea
      const sketchOffset = (maxHeight - height) * 0.5
      
      function cleanPath (path) {
        return path.filter(point => point)
      }

      function mapPath (path, mapValues = true) {
        return cleanPath(path).map(point => {
          const { x, y } = point
          if (mapValues) {
            const mappedX = clamp(x / canvasWidth * width, 0, width) + sketchOffset
            const mappedY = clamp(y / canvasHeight * height, 0, height) + sketchOffset
            return { ...point, x: mappedX, y: mappedY }
          } else {
            return point
          }
        })
      }

      const path = sketchInstance.getPath()
      const mappedPath = mapPath(path)

      let pathLength = 0
      const pathChunks = getChunks(mappedPath, 600)
      for (const pathChunk of pathChunks) {
        const { data } = await socket.post('/length', { path: pathChunk })
        const { length } = data
        pathLength += length
      }

      const fontSize = 2.5
      const name = 'P.ALBERTI   1/1'
      const length = pathLength ? `PATH LENGTH ${Math.round(pathLength) / 1000}M` : ''
      const signature = sign({
        font,
        serverConfig,
        texts: [name, length],
        textOptions: {
          letterWidth: fontSize,
          letterHeight: fontSize
        }
      })
      
      console.log(`Path length: ${Math.round(pathLength) / 1000}m`)
      const cleanedSignature = cleanPath(signature, false)

      const chunks = getChunks([...mappedPath, ...cleanedSignature], 300)
      for (const chunk of chunks) {
        await socket.post('/print', { path: chunk })
      }
    }
  })

  stop.addEventListener('click', event => {
    event.stopPropagation()
    document.body.classList.remove('is-printing')
    socket.post('/stop')
  })

  reset.addEventListener('click', async event => {
    event.stopPropagation()
    sketchInstance = await sketch({ canvas, ctx, events })
    renderSketchInstance(sketchInstance)
  })

  const events = {
    onClickCallback: null,
    onDownCallback: null,
    onUpCallback: null,
    onMoveCallback: null,
    onClick: callback => {
      events.onClickCallback = callback
    },
    onDown: callback => {
      events.onDownCallback = callback
    },
    onUp: callback => {
      events.onUpCallback = callback
    },
    onMove: callback => {
      events.onMoveCallback = callback
    }
  }

  function getOffsetCoords (event, element) {
    const { top, left } = element.getBoundingClientRect()
    const { clientX, clientY } = event
    return { x: clientX - left, y: clientY - top }
  }

  canvas.addEventListener('click', event => {
    if (events.onClickCallback) {
      const coords = getOffsetCoords(event, canvas)
      events.onClickCallback({ ...coords, canvas })
    }
  })

  canvas.addEventListener('mousedown', event => {
    if (events.onDownCallback) {
      const coords = getOffsetCoords(event, canvas)
      events.onDownCallback({ ...coords, canvas })
    }
  })

  window.addEventListener('mouseup', () => {
    if (events.onUpCallback) {
      events.onUpCallback({ canvas })
    }

    renderSketchInstance(sketchInstance)
  })

  canvas.addEventListener('mousemove', event => {
    if (events.onMoveCallback) {
      const coords = getOffsetCoords(event, canvas)
      events.onMoveCallback({ ...coords, canvas })
    }
  })

  canvas.addEventListener('touchstart', event => {
    if (events.onDownCallback) {
      const { touches } = event
      const [touch] = touches
      const coords = getOffsetCoords(touch, canvas)
      events.onDownCallback({ ...coords, canvas })
    }
  })

  canvas.addEventListener('touchmove', event => {
    if (events.onMoveCallback) {
      const { touches } = event
      const [touch] = touches
      const coords = getOffsetCoords(touch, canvas)
      events.onMoveCallback({ ...coords, canvas })
    }
  })

  window.addEventListener('touchend', () => {
    if (events.onUpCallback) {
      events.onUpCallback({ canvas })
    }

    renderSketchInstance(sketchInstance)
  })

  for (const [sketchName, sketchConstructor] of Object.entries(sketches)) {
    const menuItem = document.createElement('div')
    const menuItemTitle = document.createElement('h5')
    menuItemTitle.innerHTML = sketchName === 'adn' ? 'ADN' : capitalCase(sketchName)
    menuItem.appendChild(menuItemTitle)
    menu.appendChild(menuItem)

    menuItem.addEventListener('click', async () => {
      menu.classList.remove('menu--show')
      sketch = sketchConstructor
      sketchInstance = await sketch({ canvas, ctx, events })
      renderSketchInstance(sketchInstance)
    })
  }

  if (NODE_ENV === 'development') {
    if (sketches[DEV_SKETCH]) {
      menu.classList.remove('menu--show')
      sketch = sketches[DEV_SKETCH]
      sketchInstance = await sketch({ canvas, ctx, events })
      renderSketchInstance(sketchInstance)
    }
  }
}

initialize()
