const EventEmitter = require("events");
const WebSocket = require("ws");
const uuid = require("uuid/v4");

class SocketServer extends EventEmitter {
  constructor({ server }) {
    super();

    this.wss = new WebSocket.Server({ server });
    // this lets us look up a socket by its id;
    this.sockets = Object.create(null);
    // this is a list of all the sockets used for sending messages to everyone
    this.socketList = [];
    // this is just a number that counts up to give sockets each their own number
    this.socketId = 0;

    this.wss.on("connection", (ws, req) => {
      // new client who dis
      let id = uuid();
      this.sockets[id] = ws;
      this.socketList.push(id);

      ws.on("message", message => {
        // we're expecting JSON, but if it's not don't just throw an error.
        try {
          let msg = JSON.parse(message);
          this.emit(msg.type, id, msg);
        } catch (e) {
          console.warn("invalid message: ", message);
          console.error(e);
        }
      });

      ws.on("close", () => {
        this.sockets[id] = null;
        // remove socket from the broadcast list
        let index = this.socketList.indexOf(id);
        if (id > -1) {
          this.socketList.splice(index, 1);
        }
        this.emit("bye", id);
      });

      this.send(id, { type: "hello", id: id });
    });
  }

  broadcast(msg) {
    this.socketList.forEach(p => this.send(p, msg));
  }

  send(id, msg) {
    if (this.sockets[id]) {
      this.sockets[id].send(JSON.stringify(msg));
    } else {
      console.warn(`no socket with the id ${id}`);
    }
  }

  // all(id) {
  //   if (this.sockets[id]) {
  //     this.sockets[id].send({
  //       type: "all",
  //       list: JSON.stringify(this.socketList)
  //     });
  //   } else {
  //     console.warn(`no socket with the id ${id}`);
  //   }
  // }
}

module.exports = SocketServer;
