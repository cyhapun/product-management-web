const Chats = require('../../models/chat.model');
const Users = require('../../models/user.model');
const chatSocket = require('../../sockets/client/chat.socket');

// [GET] '/chat'
module.exports.index = async (req, res) => {
    // Socket.io
    chatSocket(res);    
    // End Socket.io

    // Get chats data
    const chats = await Chats.find({
        deleted: false
    });

    for (const chat of chats) {
        const infoUser = await Users.findOne({
            _id: chat.userId,
            deleted: false
        }).select('fullName');

        chat.infoUser = infoUser;
    }
    // End get chats data

    res.render('client/pages/chat/index.pug', {
        pageTitle: 'Chat',
        chats: chats,
    });
}