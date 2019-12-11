import Socket from './socket'
import font from './fonts/mdr.json'
import sketches from './sketches'
import { getChunks, mapChunkItems, sign } from './utils'
const { NODE_ENV } = process.env
const DEV_SKETCH = 'spiral4'

function updateCanvas (canvas, options) {
  const { width, height } = options
  const { innerWidth, innerHeight } = window
  const ratio = width / height
  const windowRatio = innerWidth / innerHeight

  if (ratio > windowRatio) {
    canvas.width = innerWidth
    canvas.height = innerWidth / ratio
    canvas.style.width = "100%"
    canvas.style.height = "initial"
  } else {
    canvas.width = innerHeight * ratio
    canvas.height = innerHeight
    canvas.style.width = "initial"
    canvas.style.height = "100%"
  }
}

async function initialize () {
  const config = { width: 210, height: 148 }
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  
  const signatureText = 'hello'
  const signatureParams = { font, canvas, ctx, textOptions: {
    letterWidth: 10,
    letterHeight: 10
  }}

  function renderSketch (sketch) {
    if (sketch) {
      const { width, height } = canvas
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      sketch.render()
    }

    sign({
      text: signatureText,
      ...signatureParams
    })
  }

  updateCanvas(canvas, config)
  window.addEventListener('resize', () => {
    updateCanvas(canvas, config)
    if (sketch) sketch.render()
  })

  let sketch = null
  let sketchTemplate = null
  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')
  const print = document.querySelector('.print')
  const stop = document.querySelector('.stop')
  const reset = document.querySelector('.reset')

  nav.addEventListener('click', event => {
    event.stopPropagation()
    menu.classList.toggle('menu--show')
  })

  print.addEventListener('click', event => {
    event.stopPropagation()
    if (sketch) {
      document.body.classList.toggle('is-printing')
      
      const path = sketch.getPath()
      const signature = sign({
        text: signatureText,
        ...signatureParams
      })

      const chunks = getChunks([...path], 3, 300)
      const { width: canvasWidth, height: canvasHeight } = canvas
      const { width, height } = config
      for (const chunk of chunks) {
        socket.send('path', mapChunkItems(chunk, 3, ([x, y, z]) => {
          return [x / canvasWidth * width, y / canvasHeight * height, z]
        }))
      }
    }
  })

  stop.addEventListener('click', event => {
    event.stopPropagation()
    document.body.classList.toggle('is-printing')
    socket.send('stop')
  })

  reset.addEventListener('click', async event => {
    event.stopPropagation()
    sketch = await sketchTemplate({ canvas, ctx, events })
    renderSketch(sketch)
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

  window.addEventListener('mouseup', event => {
    if (events.onUpCallback) {
      events.onUpCallback({ canvas })
    }

    renderSketch(sketch)
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

  window.addEventListener('touchend', event => {
    if (events.onUpCallback) {
      events.onUpCallback({ canvas })
    }

    renderSketch(sketch)
  })

  for (const [key, value] of Object.entries(sketches)) {
    const menuItem = document.createElement('div')
    const menuItemTitle = document.createElement('h5')
    menuItemTitle.innerHTML = key
    menuItem.appendChild(menuItemTitle)
    menu.appendChild(menuItem)

    menuItem.addEventListener('click', async () => {
      menu.classList.remove('menu--show')
      sketchTemplate = value
      sketch = await sketchTemplate({ canvas, ctx, events })
      renderSketch(sketch)
    })
  }

  if (NODE_ENV === 'development') {
    if (sketches[DEV_SKETCH]) {
      menu.classList.remove('menu--show')
      sketchTemplate = sketches[DEV_SKETCH]
      sketch = await sketchTemplate({ canvas, ctx, events })
      renderSketch(sketch)
    }
  }

  const socket = new Socket()
  await socket.initialize()
  socket.onMessage(message => {
    const { type, content } = message
    switch (type) {
      case 'config':
        const { ebbConfig } = content
        const { maxWidth, maxHeight } = ebbConfig
        config.width = parseFloat(maxWidth)
        config.height = parseFloat(maxHeight)
        updateCanvas(canvas, config)
        renderSketch(sketch)
        break;
      }
    })

  socket.send('config')
}

initialize()
