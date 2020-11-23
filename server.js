const express = require('express');
const http = require('http');
const SocketServer = require('./socket');

const app = express();

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

const server = http.createServer(app);
const room = new SocketServer({ server });

room.on('ping', (sender, message) => {
  room.send(sender, { type: 'pong' });
});

// room.on('all', (sender, message) => {
//   room.all(sender);
// });

room.on('hello', (sender, message) => {
  room.broadcast({ type: 'update', id: sender, hue: message.hue });
  if (message.oldId) {
    room.broadcast({ type: 'bye', id: message.oldId });
  }
});

room.on('bye', (sender) => {
  room.broadcast({ type: 'bye', id: sender });
});

room.on('data', (sender, message) => {
  room.broadcast({ type: 'update', id: sender, data: message.data });  
});

server.listen(process.env.PORT || 8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
