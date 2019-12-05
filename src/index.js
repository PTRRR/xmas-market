import Socket from './socket'
import * as geo from './geo'
// import * as quickdraw from './quick-draw'
import * as spirals from './spirals'
import { getChunks, mapChunkItems } from './utils'
const { NODE_ENV } = process.env
const DEV_SKETCH = 'tube2'

const sketches = {
  // ...quickdraw,
  ...geo,
  ...spirals
}

function updateCanvas (canvas, options) {
  const { width, height, scale } = options
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
  
  updateCanvas(canvas, config)
  window.addEventListener('resize', () => {
    updateCanvas(canvas, config)
    if (sketch) sketch.render()
  })

  let sketch = null
  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')
  const print = document.querySelector('.print')
  const stop = document.querySelector('.stop')

  nav.addEventListener('click', event => {
    event.stopPropagation()
    menu.classList.toggle('menu--show')
  })

  print.addEventListener('click', event => {
    event.stopPropagation()
    if (sketch) {
      document.body.classList.toggle('is-printing')
      const path = sketch.getPath()
      const chunks = getChunks(path, 3, 300)
      const { width, height } = config
      for (const chunk of chunks) {
        socket.send('path', mapChunkItems(chunk, 3, ([x, y, z]) => {
          return [x * width, y * height, z]
        }))
      }
    }
  })

  stop.addEventListener('click', event => {
    event.stopPropagation()
    document.body.classList.toggle('is-printing')
    socket.send('stop')
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
      const coords = getOffsetCoords(event, canvas)
      events.onUpCallback({ ...coords, canvas })
    }
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
      const { touches } = event
      const [touch] = touches
      const coords = getOffsetCoords(touch, canvas)
      events.onUpCallback({ ...coords, canvas })
    }
  })

  for (const [key, value] of Object.entries(sketches)) {
    const menuItem = document.createElement('div')
    const menuItemTitle = document.createElement('h5')
    menuItemTitle.innerHTML = key
    menuItem.appendChild(menuItemTitle)
    menu.appendChild(menuItem)

    menuItem.addEventListener('click', async () => {
      menu.classList.remove('menu--show')
      sketch = value({ canvas, ctx, events })
      sketch.render()
    })
  }

  if (NODE_ENV === 'development') {
    menu.classList.remove('menu--show')
    sketch = sketches[DEV_SKETCH]({ canvas, ctx, events })
  }

  const socket = new Socket()
  await socket.initialize()
  socket.onMessage(message => {
    const { type, content } = message
    switch (type) {
      case 'config':
        const { serverConfig } = content
        const { ebbConfig } = serverConfig
        const { maxWidth, maxHeight } = ebbConfig
        config.width = maxWidth
        config.height = maxHeight
        updateCanvas(canvas, config)
      break;
    }
  })

  socket.send('config')
}

initialize()
