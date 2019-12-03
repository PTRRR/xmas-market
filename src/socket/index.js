class Socket {
  constructor () {
    this.socket = new WebSocket('ws://localhost:8080')
    this.socket.addEventListener('open', () => {
      this.send('Connection', 'Hello Server!')
    })
  }

  send (type, content) {
    this.socket.send(JSON.stringify({ type, content }))
  }
}

const socket = new Socket()
Object.freeze(socket)
export default socket