import React, { useState, useEffect } from 'react'
import './chatapp.css'
import io from 'socket.io-client'

function ChatApp() {
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  useEffect(() => {
    // Fetch initial set of messages
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Error fetching messages:', error))

    // Setup Socket.io
    const socket = io('https://richpanel-backend1-8zql.onrender.com')

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
      setShowNotification(true)
      setNotificationMessage('New message received!')
      setTimeout(() => {
        setShowNotification(false)
        setNotificationMessage('')
      }, 5000)
    })

    // Handle message acknowledgment from server
    socket.on('acknowledgeMessage', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, isAcknowledged: true } : msg
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  function sendMessage() {
    if (!userMessage.trim()) return

    fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: userMessage,
      }),
    })
      .then((response) => response.json())
      .then((newMessage) => {
        const socket = io('https://richpanel-backend1-8zql.onrender.com')
        socket.emit('sendMessage', newMessage)
        setMessages([...messages, { ...newMessage, isAcknowledged: false }])
        setUserMessage('')
      })
      .catch((error) => console.error('Error sending message:', error))
  }

  return (
    <div className='chat-container'>
      <div className='chatBox'>
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message received ${
              msg.isAcknowledged ? 'acknowledged' : 'unacknowledged'
            }`}
          >
            {msg.text}
            {msg.isAcknowledged && <span>✅</span>}
          </div>
        ))}
      </div>
      <div className='sendMessage'>
        <input
          type='text'
          placeholder='Type a message...'
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button className='send-button' onClick={sendMessage}>
          Send
        </button>
      </div>
      {showNotification && (
        <div className='notification'>{notificationMessage}</div>
      )}
    </div>
  )
}

export default ChatApp
