class Socket {
  constructor () {
    this.ready = false;
    this.handlers = {
      open: new Set(),
      close: new Set(),
      message: new Set()
    };
    this.backoff = 100;
    this.connecting = false;
  }

  init() {
    if (this.connecting) {
      return;
    }
    this.connecting = true;
    this.socket = new WebSocket('wss://' + location.host);
    
    // Listen for messages
    this.socket.addEventListener('message', event => {
      try {
        let msg = JSON.parse(event.data);
        this.handlers.message.forEach(h => h(msg));
      } catch (e) {
        console.error(e);
        console.warn('bad message recieved:' + event.data);
      }
    });

    // Connection opened
    this.socket.addEventListener('open', event => {
      console.log('connected!');
      
      this.connecting = false;
      this.ready = true;    
      this.backoff = 100;
      this.handlers.open.forEach(h => h());
      
      // Keep the connection alive. Lots of servers require this.
      clearInterval(this._pingInterval);
      this._pingInterval = setInterval(() => {
        this.send({ type: 'ping'});
      }, 5000);
    });
    
    this.socket.addEventListener('error', event => {
      console.log('connection error');
      this.connecting = false;
      this.ready = false;
      this._reconnect();
    });
    
    this.socket.addEventListener('close', event => {
      console.log('connection lost');
      this.connecting = false;
      this.ready = false;
      this.handlers.close.forEach(h => h());
      clearInterval(this._pingInterval);
      this._reconnect();
    });
    
  }
  
  _reconnect() {
    if (this.connecting) {
      return;
    }
    console.log('reconnecting');
    this.backoff = Math.min(this.backoff * 2, 10000);
    setTimeout(() => this.init(), this.backoff);
  }

  send(msg) {
    if (this.ready) {
      this.socket.send(JSON.stringify(msg));
    }
  }
  
  on(type, handler) {
    if (this.handlers[type]) {
      this.handlers[type].add(handler);
    }
  }
}