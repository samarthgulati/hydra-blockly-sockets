/* global Socket */
let i = 0;
let all = [];
let server = new Socket();
server.on("message", handleMessage);

let myId;

function handleMessage(message) {
  console.log(message);
  //On hello from the server - assign id to self.
  if (message.type === "hello") {
    server.send({ type: "hello", oldId: myId });
    myId = message.id;
  }

  // On getting info about clients.
  if (message.type === "update") {
    // console.log(message)
    //check if the element exist or not
    //check if the ul is less than 2 or not
    if((all.indexOf(message.id) < 0) && all.length<2){
      all.push(message.id);
      // server.send({ type: "hello", oldId: myId });
    }

    //if the client is self then assign shape to the client
    if (message.id !== myId && 'data' in message) {
      // console.log(message)
      showOverlay();
      updateURL(message.data);
      loadState(message.data);
    }
  }

  //On leave of a client remove the circle.
  if (message.type === "bye") {
    all.splice(all.indexOf(message.id), 1)

  }
}

window.addEventListener("load", e => {
  server.init(); //iniate load
});
