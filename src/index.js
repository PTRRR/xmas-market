import socket from './socket'
import * as geo from './geo'
import * as quickdraw from './quick-draw'
import * as spirals from './spirals'
import { getChunks } from './utils'
const { NODE_ENV } = process.env
const DEV_SKETCH = 'tube2'

const sketches = {
  ...geo,
  ...quickdraw,
  ...spirals
}

async function initialize () {
  const width = window.innerWidth
  const height = window.innerHeight
  const canvas = document.querySelector('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  let path = null
  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')
  const print = document.querySelector('.print')
  const stop = document.querySelector('.stop')

  print.addEventListener('click', () => {
    document.body.classList.toggle('is-printing')
    const chunks = getChunks(path, 300, 3)
    for (const chunk of chunks) {
      console.log(chunk)
      socket.send('path', chunk)
    }
  })

  stop.addEventListener('click', () => {
    document.body.classList.toggle('is-printing')
    socket.send('stop')
  })

  nav.addEventListener('click', () => {
    menu.classList.toggle('menu--show')
  })

  for (const [key, value] of Object.entries(sketches)) {
    const menuItem = document.createElement('div')
    const menuItemTitle = document.createElement('h5')
    menuItemTitle.innerHTML = key
    menuItem.appendChild(menuItemTitle)
    menu.appendChild(menuItem)

    menuItem.addEventListener('click', async () => {
      menu.classList.remove('menu--show')
      path = await value(ctx, width, height, pathToDraw => {
        path = pathToDraw
      }) || []
    })

    setTimeout (async () => {
      if (NODE_ENV === 'development' && DEV_SKETCH === key) {
        menu.classList.remove('menu--show')
        path = await value(ctx, width, height, pathToDraw => {
          path = pathToDraw
        }) || []
      }
    }, 100)
  }
}

initialize()
