const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  message: String,
  from: {
    name: String,
    email: String,
    id: String,
  },
  to: {
    data: [
      {
        name: String,
        email: String,
        id: String,
      },
    ],
  },
  created_time: String,
})

module.exports = mongoose.model('Message', messageSchema)
