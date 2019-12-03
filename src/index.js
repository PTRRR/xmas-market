import socket from './socket'
import * as geo from './geo'
import * as quickdraw from './quick-draw'
import * as fields from './fields'
import { getChunks } from './utils'

const sketches = {
  ...geo,
  ...quickdraw,
  ...fields
}

async function initialize () {
  const width = window.innerWidth
  const height = window.innerHeight
  const canvas = document.querySelector('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const nav = document.querySelector('nav')
  const menu = document.querySelector('.menu')

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
      const path = await value(ctx, width, height) || []
      const chunks = getChunks(path, 300, 3)
      for (const chunk of chunks) {
        console.log(chunk)
        // socket.send(chunk)
      }
    })
  }
}

initialize()
