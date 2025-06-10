// Connect mongoose
const mongoose = require('mongoose');

module.exports.connect = (MONGODB_URL) => {
  mongoose.connect(MONGODB_URL)
    .then(() => {
      console.log("Connect to mongodb successfull!");
    })
    .catch((err) => {
      console.log("Connect to mongodb failed: ", err);
    })
}
// End connect mongoose