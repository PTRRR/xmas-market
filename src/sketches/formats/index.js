export async function drawFormat ({ ctx, canvas }) {
  let fullpath = []
  function drawCircle (x, y, r) {
    const path = []
    ctx.beginPath()
    for (let i = 0; i < 101; i++) {
      const angle = i / 100 * Math.PI * 2
      const cX = Math.cos(angle) * r + x
      const cY = Math.sin(angle) * r + y
      ctx.lineTo(cX, cY)

      if (i === 0) {
        path.push(cX, cY, 0)
      }
      path.push(cX, cY, 1)
    }
    ctx.stroke()
    return path
  }

  function render () {
    fullpath = []
    const { width, height } = canvas
    const x = width
    const y = height

    ctx.beginPath()
    ctx.rect(0, 0, x, y)
    ctx.stroke()
    
    let circle = drawCircle(100, 100, 100)
    fullpath.push(...circle)
    circle = drawCircle(width - 100, height - 100, 100)
    fullpath.push(...circle)

    fullpath.push(0, 0, 1)
    fullpath.push(x, 0, 1)
    fullpath.push(x, y, 1)
    fullpath.push(0, y, 1)
    fullpath.push(0, 0, 1)
  }

  return {
    render,
    getPath: () => fullpath
  }
}