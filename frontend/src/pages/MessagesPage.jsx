import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaSmile, FaPaperPlane } from 'react-icons/fa'
import {
  getGroupMessages,
  sendMessage,
  markMessagesAsRead,
} from '../services/messagesApi'
import './MessagesPage.css'

export default function MessagesPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [group, setGroup] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (groupId) {
      fetchMessages()
      markMessagesAsRead(groupId)
    }
  }, [groupId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getGroupMessages(groupId, 50, 0)
      setMessages(data.messages || [])
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load messages')
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    try {
      setSending(true)
      const newMessage = await sendMessage(groupId, messageText)
      setMessages((prev) => [...prev, newMessage])
      setMessageText('')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to send message')
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="messages-page"
    >
      <div className="messages-header">
        <button onClick={() => navigate('/messages')} className="messages-back-btn">
          <FaArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1>Message</h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="messages-container">
        {loading && (
          <div className="messages-loading">
            <div className="spinner" />
            <p>Loading messages...</p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="messages-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg._id} className="message-item">
                <div className="message-avatar">
                  {msg.senderId?.profileImage ? (
                    <img src={msg.senderId.profileImage} alt="User" />
                  ) : (
                    <div className="avatar-placeholder">
                      {msg.senderName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="message-body">
                  <div className="message-header">
                    <strong className="message-sender">{msg.senderName}</strong>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="messages-footer">
          {error && <div className="message-error">{error}</div>}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="message-input"
            />
            <button
              type="button"
              className="message-emoji-btn"
              title="Emoji"
              disabled={sending}
            >
              <FaSmile />
            </button>
            <button
              type="submit"
              className="message-send-btn"
              disabled={sending || !messageText.trim()}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  )
}
