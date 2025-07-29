const Chats = require('../../models/chat.model');
const Users = require('../../models/user.model');

// [GET] '/chat'
module.exports.index = async (req, res) => {
  const userId = res.locals.user._id;

  // Socket.io
  _io.once('connection', async (socket) =>  {
    // Server receive message from client
    socket.on("CLIENT_SEND_MESSAGE", async (msg) => {
      // Save messages from client
      const chat = new Chats({
        userId: userId,
        content: msg,
      });
      await chat.save();
    });
  
  });
  // End Socket.io

  // Get chats data
  const chats = await Chats.find({deleted: false});

  for (const chat of chats) {
    const infoUser = await Users.findOne({_id: chat.userId, deleted:false}).select('fullName');

    chat.infoUser = infoUser;
  }
  // End get chats data

  res.render('client/pages/chat/index.pug', {
    pageTitle:'Chat',
    chats:chats,
  });
}