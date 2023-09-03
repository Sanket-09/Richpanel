const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const http = require('http')
const socketIo = require('socket.io')
const axios = require('axios')
const cron = require('node-cron')
const fs = require('fs')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const session = require('express-session')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const VERIFY_TOKEN = 'VeR1fyT0k3n$ecur3P@ssw0rd'
const LAST_FETCHED_FILE = './LAST_FETCHED_FILE.json'

// MongoDB model
const messageSchema = new mongoose.Schema({
  senderID: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Message = mongoose.model('Message', messageSchema)

// Middleware
app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to `true` if using HTTPS
  })
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new FacebookStrategy(
    {
      clientID: 618455903770825,
      clientSecret: '3b6b2f2321484679fe53723712b13ce7',
      callbackURL: 'http://localhost:5000/auth/facebook/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB')
      resolve()
    })

    mongoose.connection.on('error', (err) => {
      console.error('Error connecting to MongoDB', err)
      reject(err)
    })

    mongoose.connection.on('disconnected', () => {
      console.error('Disconnected from MongoDB. Attempting to reconnect...')
      setTimeout(() => {
        initializeDatabase().catch((err) =>
          console.error('Failed to reconnect to MongoDB:', err)
        )
      }, 5000)
    })
  })
}

const PAGE_ACCESS_TOKEN =
  'EAAIye3x0GMkBOwvzMzLV6ryvJuZCk5LydtckcPZCFCB65TaW1Dn3WRujCgJQ7xW7ZC4ZAFjDaeEiEWPQZBcEzdFiBd9fVhaUFn2mYqU2WcaM6S00T2DNKCucZAY7ZA8KcTKFXr3NsfJgWiAKrErFcuZAKiNN6oGbwfDVnerLpbee7ayUB4bxoDbqtaX1i5oHG00ZD'
const PAGE_ID = '116628254867580'

async function fetchConversations() {
  try {
    let lastFetched = 0
    if (fs.existsSync(LAST_FETCHED_FILE)) {
      lastFetched = JSON.parse(
        fs.readFileSync(LAST_FETCHED_FILE, 'utf-8')
      ).timestamp
    } else {
      fs.writeFileSync(
        LAST_FETCHED_FILE,
        JSON.stringify({ timestamp: lastFetched })
      )
    }

    let response = await axios.get(
      `https://graph.facebook.com/v12.0/${PAGE_ID}/conversations`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          since: lastFetched,
        },
      }
    )
    let conversations = response.data.data
    let newestTimestamp = lastFetched

    for (let conversation of conversations) {
      let user_id = conversation.id
      response = await axios.get(
        `https://graph.facebook.com/v12.0/${user_id}/messages`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            since: lastFetched,
          },
        }
      )
      let messages = response.data.data

      for (let msg of messages) {
        let message_id = msg.id
        response = await axios.get(
          `https://graph.facebook.com/v12.0/${message_id}`,
          {
            params: {
              fields: 'message,attachments,from,to,created_time',
              access_token: PAGE_ACCESS_TOKEN,
            },
          }
        )
        let messageDetail = response.data
        newestTimestamp = Math.max(
          newestTimestamp,
          new Date(messageDetail.created_time).getTime()
        )

        const existingMessage = await Message.findOne({
          senderID: messageDetail.from.id,
          text: messageDetail.message,
        })
        if (!existingMessage) {
          const message = new Message({
            senderID: messageDetail.from.id,
            text: messageDetail.message,
          })
          await message.save()
        }
      }
    }

    fs.writeFileSync(
      LAST_FETCHED_FILE,
      JSON.stringify({ timestamp: newestTimestamp })
    )
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Rate limited by Facebook. Waiting for a while...')
      setTimeout(fetchConversations, 60000) // 1 minute delay
    } else {
      console.error('Error fetching from Facebook:', error)
    }
  }
}

app.get('../components/pages/HomePage.jsx', async (req, res) => {
  const pageAccessToken =
    'EAAIye3x0GMkBO7DuTUZAk5pZBixnWYooVBtCR2xyhSsYIYdf5ZAR1U9tqIctN9Q7EeL1wv8qsf2jRbiFATDZBMzUFdSGHVRdZAwF7Ozh1B5TJjdQ2ZCHB9439W7G1ZBD8DevcNYy6jgULOfJmlwQqBLaT8mEbUZCzxcqZAa3iC9BiZBoDotbNLHkSlHTirvPVoWjrKyh2TZBQiV61GTh6GWvxnDUQcZD'
  const pageId = 'me'
  const fields = 'name'

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v17.0/${pageId}?fields=${fields}&access_token=${pageAccessToken}`
    )
    const pageName = response.data.name
    res.render('homepage', { pageName })
  } catch (error) {
    console.error('Error fetching Facebook Page information:', error)
    res.render('homepage', { pageName: 'Page Name Unavailable' })
  }
})

app.get('/auth/facebook', passport.authenticate('facebook'))
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard')
  }
)

const userIdNameMap = new Map()

async function fetchUserName(userId) {
  if (userIdNameMap.has(userId)) {
    return userIdNameMap.get(userId)
  }

  try {
    const response = await axios.get(`https://graph.facebook.com/${userId}`, {
      params: {
        fields: 'name',
        access_token: PAGE_ACCESS_TOKEN,
      },
    })
    const userName = response.data.name
    userIdNameMap.set(userId, userName)
    return userName
  } catch (error) {
    console.error('Error fetching Facebook User name:', error)
    return null
  }
}

// Facebook Messenger Webhook Verification
app.get('/webhook', (req, res) => {
  const {
    'hub.mode': mode,
    'hub.verify_token': token,
    'hub.challenge': challenge,
  } = req.query

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFIED')
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(400)
  }
})

app.post('/webhook', (req, res) => {
  const data = req.body

  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      const messaging = entry.messaging
      messaging.forEach((msgEvent) => {
        if (msgEvent.message) {
          handleMessageEvent(msgEvent)
        }
      })
    })
    res.status(200).send('EVENT_RECEIVED')
  } else {
    res.sendStatus(404)
  }
})

function handleMessageEvent(msgEvent) {
  const senderID = msgEvent.sender.id
  const messageText = msgEvent.message.text
  saveMessageToDB(senderID, messageText)
}

async function saveMessageToDB(senderID, messageText) {
  const message = new Message({ senderID, text: messageText })

  try {
    await message.save()
    console.log('Message saved successfully!')
  } catch (err) {
    console.error('Error saving message to DB:', err)
  }
}

// Routes for API messages
app.post('/api/messages', async (req, res) => {
  try {
    const newMessage = new Message(req.body)
    const savedMessage = await newMessage.save()
    res.status(201).send(savedMessage)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find({})
    res.send(messages)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Socket.io setup
const server = http.createServer(app)
const io = socketIo(server)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message)
    socket.emit('acknowledgeMessage', message._id)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Start the server with Socket.io
initializeDatabase()
  .then(() => {
    cron.schedule('*/1 * * * *', fetchConversations)

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize due to:', err)
  })
