import Socket from './socket'
import * as geo from './geo'
// import * as quickdraw from './quick-draw'
import * as spirals from './spirals'
import { getChunks } from './utils'
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

async function setupApp (canvas) {
  const ctx = canvas.getContext('2d')
  let path = null
}

async function initialize () {
  const config = {
    width: 1000,
    height: 1000,
    scale: 1
  }

  const canvas = document.querySelector('canvas')
  updateCanvas(canvas, config)
  const ctx = canvas.getContext('2d')
  window.addEventListener('resize', () => {
    updateCanvas(canvas, config)
  })

  let sketch = null
  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')
  const print = document.querySelector('.print')
  const stop = document.querySelector('.stop')

  nav.addEventListener('click', () => {
    menu.classList.toggle('menu--show')
  })

  print.addEventListener('click', () => {
    if (sketch) {
      document.body.classList.toggle('is-printing')
      const chunks = getChunks(path, 300, 3)
      for (const chunk of chunks) {
        socket.send('path', chunk)
      }
    }
  })

  stop.addEventListener('click', () => {
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

  canvas.addEventListener('click', event => {
    if (events.onClickCallback) {
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = event
      events.onClickCallback({ x: x - left, y: y - top })
    }
  })

  canvas.addEventListener('mousedown', event => {
    if (events.onDownCallback) {
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = event
      events.onDownCallback({ x: x - left, y: y - top })
    }
  })

  window.addEventListener('mouseup', event => {
    if (events.onUpCallback) {
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = event
      events.onUpCallback({ x: x - left, y: y - top })
    }
  })

  canvas.addEventListener('mousemove', event => {
    if (events.onMoveCallback) {
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = event
      events.onMoveCallback({ x: x - left, y: y - top })
    }
  })

  canvas.addEventListener('touchstart', event => {
    if (events.onDownCallback) {
      const { touches } = event
      const [touch] = touches
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = touch
      events.onDownCallback({ x: x - left, y: y - top })
    }
  })

  canvas.addEventListener('touchmove', event => {
    if (events.onMoveCallback) {
      const { touches } = event
      const [touch] = touches
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = touch
      events.onMoveCallback({ x: x - left, y: y - top })
    }
  })

  window.addEventListener('touchend', event => {
    if (events.onUpCallback) {
      const { touches } = event
      const [touch] = touches
      const { top, left } = canvas.getBoundingClientRect()
      const { clientX: x, clientY: y } = touch
      events.onUpCallback({ x: x - left, y: y - top })
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
      sketch = value({ ctx, events, config })
      sketch.render()
    })
  }

  if (NODE_ENV === 'development') {
    menu.classList.remove('menu--show')
    sketch = sketches[DEV_SKETCH]({ ctx, events, config })
  }

  const socket = new Socket()
  await socket.initialize()
  socket.onMessage(message => {
    const { type, content } = message
    switch (type) {
      case 'config':
        const { globalConfig, serverConfig } = content
        const { MILLIMETER_IN_STEPS } = globalConfig
        const { ebbConfig } = serverConfig
        const { maxWidth, maxHeight } = ebbConfig
        config.width = maxWidth
        config.height = maxHeight
        config.scale = MILLIMETER_IN_STEPS
        updateCanvas(canvas, config)
      break;
    }
  })

  socket.send('config')
}

initialize()
