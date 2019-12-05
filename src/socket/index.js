const { hostname } = window.location

class Socket {
  constructor () {
    this.onMessageCallback = null
    this.socket = null
  }

  async initialize () {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`ws://${hostname}:8080`)
      
      this.socket.addEventListener('open', () => {
        this.send('Connection', 'XMAS CLIENT')
        resolve()
      })

      this.socket.addEventListener('error', () => {
        reject()
      })

      this.socket.addEventListener('message', ({ data }) => {
        if (this.onMessageCallback) this.onMessageCallback(JSON.parse(data))
      })
    })
  }

  onMessage (callback) {
    this.onMessageCallback = callback
  }

  send (type, content) {
    this.socket.send(JSON.stringify({ type, content }))
  }
}

export default Socket