export async function field (ctx, width, height) {
  const fieldSize = 20
  const fieldGap = 30
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 1000; i++) {
    const r = Math.tan(i % 2) * (i * 0.031) * 10
    const x = Math.cos(i * 0.1) * r + width * 0.5
    const y = Math.sin(i * 0.1) * r + height * 0.5
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

export async function field2 (ctx, width, height) {
  const gui = document.querySelector('.gui')
  const n = document.createElement('input')
  n.setAttribute('type', 'range')
  n.setAttribute('min', '-5')
  n.setAttribute('max', '5')
  n.setAttribute('step', '0.0001')
  gui.appendChild(n)

  const v = document.createElement('input')
  v.setAttribute('type', 'range')
  v.setAttribute('min', '-1')
  v.setAttribute('max', '1')
  v.setAttribute('step', '0.0001')
  gui.appendChild(v)

  n.addEventListener('input', () => {
    draw(n.value, v.value)
  })

  v.addEventListener('input', () => {
    draw(n.value, v.value)
  })

  function draw (val1, val2) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    const fieldSize = 20
    const fieldGap = 30
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (let i = 0; i < 1000; i++) {
      const r = Math.sin(i % 100 * val1) * 400 * Math.cos(i * val2)
      const x = Math.cos(i * 0.1) * r + width * 0.5
      const y = Math.sin(i * 0.1) * r + height * 0.5
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }
}

export async function field3 (ctx, width, height) {
  const fieldSize = 20
  const fieldGap = 30
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 10000; i++) {
    const r = 30 + Math.sin(i * 0.6) * Math.cos(i * 0.014) * 30 + i * 0.04
    const x = Math.cos(i * 0.045) * r + width * 0.5
    const y = Math.sin(i * 0.045) * r + height * 0.5
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

export async function field4 (ctx, width, height) {
  const fieldSize = 20
  const fieldGap = 30
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + Math.sin(i * 0.001) * 30
    const x = Math.cos(i * 0.1) * r + width * 0.5 + i * 0.03
    const y = Math.sin(i * 0.1) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + Math.sin(i * 0.001 + Math.PI) * 30
    const x = Math.cos(i * 0.1) * r + width * 0.5 + 80 + Math.min(Math.max(-6, Math.tan(i * 0.001)), 6) * 50
    const y = Math.sin(i * 0.1) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}

function clamp (val, min, max) {
  return Math.min(Math.max(val, min), max)
} 

export async function field5 (ctx, width, height) {
  const fieldSize = 20
  const fieldGap = 30

  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + clamp(Math.sin(i * 0.0004), -6, 6) * 100
    const x = Math.cos(i * 0.1 + Math.sin(i * 0.0001)) * r + width * 0.5
    const y = Math.sin(i * 0.1 + Math.cos(i * 0.0002)) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let i = 0; i < 20000; i++) {
    const r = 30 + clamp(Math.sin(i * 0.0004 + Math.PI *0.5), -6, 6) * 100
    const x = Math.cos(i * 0.1 + Math.sin(i * 0.0001)) * r + width * 0.5 + 150
    const y = Math.sin(i * 0.1 + Math.cos(i * 0.0002 + 10)) * r + i * 0.05
    ctx.lineTo(x, y)
  }

  ctx.stroke()
}