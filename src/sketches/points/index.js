import allPoints from './points3.json'

export function points ({ canvas, ctx }) {
  let fullPath = []

  function render () {
    fullPath = []
    const { width, height } = canvas
    for (const point of allPoints) {
      const { x, y } = point
      ctx.beginPath()
      ctx.arc(x * width * 0.3 + 400, y * height * 0.3, 5, 0, Math.PI * 2)
      ctx.stroke()
      fullPath.push(x * width * 0.3 + 400, y * height * 0.3, 0)
      fullPath.push(x * width * 0.3 + 400, y * height * 0.3, 1)
    }
  }

  return {
    render,
    getPath: () => fullPath
  }
}