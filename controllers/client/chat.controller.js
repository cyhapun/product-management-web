// [GET] '/chat'
module.exports.index = (req, res) => {
  // Socket.io
  _io.on('connection', (socket) => {
    console.log('a user connected with socket id: ', socket.id);
    
    // Server send socket id to client
    socket.emit("SERVER_SEND_SOCKET_ID", socket.id);
  
    // Server receive message from client
    socket.on("CLIENT_SEND_MESSAGE", (msg) => {
      console.log("Client response: ", msg);
  
      // Server return to only the sender
      // socket.emit("SERVER_RETURN", "HI CAI CC");
    
      // Server return all 
      // _io.emit("SERVER_RETURN", "HI CC");
  
      // Server return all expect the sender
      socket.broadcast.emit("SERVER_RETURN", "HI CC");
    });
  });
  // End Socket.io

  res.render('client/pages/chat/index.pug', {
    pageTitle:'Chat',
  });
}