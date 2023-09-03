import React, { useState, useEffect } from 'react'
import io from 'socket.io-client' // <-- 1. Import socket.io-client
import './chat.css'

let socket

const UsersList = ({ users, selectedUser, handleUserClick }) => (
  <div className='users'>
    <h2>Conversations</h2>
    {users.map((user) => (
      <div
        key={user}
        className={`user ${selectedUser === user ? 'selected-user' : ''}`}
        onClick={() => handleUserClick(user)}
      >
        {user}
      </div>
    ))}
  </div>
)

const ChatWindow = ({ messages, selectedUser, onSendMessage }) => {
  return (
    <div className='chat-window'>
      <h4>{selectedUser || 'Select a user to view messages'}</h4>
      <div className='chat-messages'>
        {messages
          .filter(
            (message) =>
              message.senderID === selectedUser ||
              message.senderID === 'currentUserID'
          )
          .map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.senderID === selectedUser ? 'receiver' : 'sender'
              } clearfix`}
            >
              <p>{message.text}</p>
            </div>
          ))}
      </div>
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  )
}

const ChatInput = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className='chat-input'>
      <span className='inputbox'>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Type a message...'
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
      </span>
      <button onClick={handleSend}>Send</button>
    </div>
  )
}

function Chat() {
  const [messages, setMessages] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetch('https://richpanel-backend1-8zql.onrender.com/api/messages')
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Error fetching messages:', error))
  }, [])

  const users = [...new Set(messages.map((message) => message.senderID))]

  const handleUserClick = (user) => {
    setSelectedUser(user)
  }

  const sendMessage = (text) => {
    const newMessage = {
      _id: Date.now().toString(),
      senderID: 'currentUserID',
      text: text,
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  function Toolbar() {
    return <div className='toolbar'></div>
  }
  return (
    <div className='chat-container'>
      <Toolbar />
      <UsersList
        users={users}
        selectedUser={selectedUser}
        handleUserClick={handleUserClick}
      />
      <ChatWindow
        messages={messages}
        selectedUser={selectedUser}
        onSendMessage={sendMessage}
      />
    </div>
  )
}

export default Chat
