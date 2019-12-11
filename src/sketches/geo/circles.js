export async function test ({ ctx, canvas }) {
  const { width, height } = canvas
  const cX = width * 0.5
  const cY = height * 0.5

  const points = 100
  const iterations = 3
  let radius = 0
  for (let i = 0; i < points * iterations; i++) {
    const angle = (i / points) * Math.PI * 2
    const x = Math.cos(angle) * radius + cX
    const y = Math.sin(angle) * radius + cY
    const circleDefinition = 20

    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let j = 0; j < circleDefinition + 1; j++) {
      const circleAngle = j / circleDefinition * Math.PI * 2
      const lX = Math.cos(circleAngle) * (Math.cos(radius * 0.001) * 200) + x
      const lY = Math.sin(circleAngle) * (Math.sin(radius * 0.001) * 200) + y
      ctx.lineTo(lX, lY)
    }
    ctx.stroke()
    

    // ctx.beginPath()
    // ctx.arc(x, y, 300 - radius, 100, 0, Math.PI * 2)
    ctx.stroke()

    radius += 1
  }
}