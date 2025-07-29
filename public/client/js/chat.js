var socket = io();

// Receive messages from server
socket.on('SERVER_SEND_SOCKET_ID', function(msg) {
  document.getElementById('socket-id').innerText = msg;
});

// Send messages to server
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('CLIENT_SEND_MESSAGE', input.value);
    input.value = '';
  }
});

// Receive return messages from server
socket.on('SERVER_RETURN', function(msg) {
  console.log("receive return messages");
  var messages = document.getElementById('messages');
  messages.innerText = msg;
});