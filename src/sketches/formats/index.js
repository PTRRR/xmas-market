export async function a3 ({ ctx, canvas }) {
  const fullpath = []
  function render () {
    const { width, height } = canvas
    const x = width
    const y = height
    ctx.rect(0, 0, x, y)
    ctx.stroke()

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