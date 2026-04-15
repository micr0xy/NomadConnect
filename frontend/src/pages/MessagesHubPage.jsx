import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaUsers, FaUser, FaClock, FaArrowRight, FaSearch, FaPaperPlane, FaSmile } from 'react-icons/fa'
import useAuthStore from '../store/authStore'
import { getGroupMessages, getUserGroups, markMessagesAsRead, sendMessage } from '../services/messagesApi'
import { listEvents } from '../services/eventsApi'
import './MessagesHubPage.css'

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return 'No messages yet'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'No messages yet'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString()
}

const formatEventTime = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Upcoming event'
  }
}

const formatMessageTime = (dateValue) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagesHubPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [activeTab, setActiveTab] = useState('direct')
  const [searchTerm, setSearchTerm] = useState('')
  const [directGroups, setDirectGroups] = useState([])
  const [groupChats, setGroupChats] = useState([])
  const [selectedDirectGroupId, setSelectedDirectGroupId] = useState('')
  const [selectedMessages, setSelectedMessages] = useState([])
  const [loadingSelectedMessages, setLoadingSelectedMessages] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setMobileThreadOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (activeTab !== 'direct') {
      setMobileThreadOpen(false)
    }
  }, [activeTab])

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        setLoading(true)
        setError('')

        const [groups, events] = await Promise.all([
          getUserGroups(),
          listEvents(),
        ])

        const privateGroups = (groups || []).filter((group) => group.isPrivate)
        setDirectGroups(privateGroups)
        if (privateGroups.length > 0) {
          setSelectedDirectGroupId(privateGroups[0]._id)
        }

        const normalizedUserEmail = (user?.email || '').toLowerCase()
        const participatedEvents = (events || []).filter((event) => {
          const isParticipant = event.participants?.some(
            (p) => (p.userEmail || '').toLowerCase() === normalizedUserEmail
          )
          const isCreator = (event.createdByEmail || '').toLowerCase() === normalizedUserEmail
          return isParticipant || isCreator
        })

        setGroupChats(participatedEvents)
      } catch (fetchError) {
        setError(typeof fetchError === 'string' ? fetchError : 'Failed to load chats')
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      fetchHubData()
    }
  }, [user?.email])

  useEffect(() => {
    const fetchSelectedMessages = async () => {
      if (!selectedDirectGroupId) {
        setSelectedMessages([])
        return
      }

      try {
        setLoadingSelectedMessages(true)
        const data = await getGroupMessages(selectedDirectGroupId, 80, 0)
        setSelectedMessages(data.messages || [])
        await markMessagesAsRead(selectedDirectGroupId)
      } catch (fetchError) {
        setError(typeof fetchError === 'string' ? fetchError : 'Failed to load conversation')
      } finally {
        setLoadingSelectedMessages(false)
      }
    }

    if (activeTab === 'direct') {
      fetchSelectedMessages()
    }
  }, [selectedDirectGroupId, activeTab])

  const directRows = useMemo(() => {
    const currentUserId = String(user?._id || '')

    return directGroups.map((group) => {
      const otherParticipant = (group.participants || []).find(
        (participant) => String(participant._id || '') !== currentUserId
      )

      const name = otherParticipant
        ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || 'Traveler'
        : 'Traveler'

      return {
        id: group._id,
        groupId: group._id,
        avatar: otherParticipant?.profileImage || '',
        name,
        email: otherParticipant?.email || '',
        lastMessage: group.lastMessage?.text || 'Tap to start chatting',
        lastTime: formatTimeAgo(group.lastMessage?.sentAt || group.updatedAt),
        hasRecentMessage: Boolean(group.lastMessage?.text),
      }
    })
  }, [directGroups, user?._id])

  const filteredDirectRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return directRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        row.name.toLowerCase().includes(normalizedSearch) ||
        row.lastMessage.toLowerCase().includes(normalizedSearch)

      return matchesSearch
    })
  }, [directRows, searchTerm])

  const selectedDirectRow = useMemo(
    () => directRows.find((row) => row.groupId === selectedDirectGroupId) || null,
    [directRows, selectedDirectGroupId]
  )

  const isCurrentUserMessage = (message) => {
    const senderId = String(message?.senderId?._id || message?.senderId || '')
    return senderId && senderId === String(user?._id || '')
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!selectedDirectGroupId || !messageText.trim()) {
      return
    }

    try {
      setSending(true)
      const newMessage = await sendMessage(selectedDirectGroupId, messageText)
      setSelectedMessages((prev) => [...prev, newMessage])
      setDirectGroups((prevGroups) =>
        prevGroups.map((group) => (
          group._id === selectedDirectGroupId
            ? {
              ...group,
              lastMessage: {
                ...(group.lastMessage || {}),
                text: messageText.trim(),
                sentAt: new Date().toISOString(),
              },
            }
            : group
        ))
      )
      setMessageText('')
    } catch (sendError) {
      setError(typeof sendError === 'string' ? sendError : 'Failed to send message')
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
      className="messages-hub-page"
    >
      <div className="messages-hub-header">
        <button onClick={() => navigate(-1)} className="messages-hub-back-btn">
          <FaArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1>Messages</h1>
        <div style={{ width: 68 }} />
      </div>

      <div className="messages-hub-container">
        <div className="messages-hub-tabs">
          <button
            type="button"
            className={`messages-hub-tab ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct')}
          >
            Message
          </button>
          <button
            type="button"
            className={`messages-hub-tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Group Chats
          </button>
        </div>

        {error && <div className="messages-hub-error">{error}</div>}

        {loading ? (
          <div className="messages-hub-loading">Loading conversations...</div>
        ) : activeTab === 'direct' ? (
          <div className={`messages-split-layout ${isMobile ? 'mobile' : ''}`}>
            {(!isMobile || !mobileThreadOpen) && (
              <div className="messages-split-left">
              <div className="messages-search-wrap">
                <FaSearch size={12} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search messages"
                />
              </div>

              <div className="messages-hub-list">
                {filteredDirectRows.length === 0 ? (
                  <div className="messages-hub-empty">
                    <FaUser size={18} />
                    <p>No messages yet</p>
                    <span>When you message someone, they will appear here.</span>
                  </div>
                ) : (
                  filteredDirectRows.map((row) => (
                    <button
                      key={row.id}
                      className={`messages-hub-card ${selectedDirectGroupId === row.groupId ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedDirectGroupId(row.groupId)
                        if (isMobile) {
                          setMobileThreadOpen(true)
                        }
                      }}
                    >
                      <div className="messages-hub-avatar">
                        {row.avatar ? (
                          <img src={row.avatar} alt={row.name} />
                        ) : (
                          <span>{row.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="messages-hub-card-content">
                        <p className="messages-hub-card-title">{row.name}</p>
                        <p className="messages-hub-card-subtitle">{row.lastMessage}</p>
                        <div className="messages-hub-meta">
                          <span><FaClock size={11} /> {row.lastTime}</span>
                        </div>
                      </div>
                      {row.hasRecentMessage && <span className="messages-hub-dot" />}
                    </button>
                  ))
                )}
              </div>
              </div>
            )}

            {(!isMobile || mobileThreadOpen) && (
              <div className="messages-split-right">
              {selectedDirectRow ? (
                <>
                  <div className="messages-thread-header">
                    {isMobile && (
                      <button
                        type="button"
                        className="messages-thread-back"
                        onClick={() => setMobileThreadOpen(false)}
                        aria-label="Back to conversations"
                      >
                        <FaArrowLeft size={12} />
                      </button>
                    )}
                    <div className="messages-hub-avatar thread-avatar">
                      {selectedDirectRow.avatar ? (
                        <img src={selectedDirectRow.avatar} alt={selectedDirectRow.name} />
                      ) : (
                        <span>{selectedDirectRow.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="messages-thread-title">{selectedDirectRow.name}</p>
                      <p className="messages-thread-subtitle">{selectedDirectRow.email || 'Direct message'}</p>
                    </div>
                  </div>

                  <div className="messages-thread-list">
                    {loadingSelectedMessages ? (
                      <div className="messages-thread-empty">Loading chat...</div>
                    ) : selectedMessages.length === 0 ? (
                      <div className="messages-thread-empty">No messages yet. Start the conversation.</div>
                    ) : (
                      selectedMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`messages-thread-item ${isCurrentUserMessage(message) ? 'own' : 'other'}`}
                        >
                          <p className="messages-thread-bubble">{message.text}</p>
                          <span className="messages-thread-time">{formatMessageTime(message.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form className="messages-thread-input-row" onSubmit={handleSendMessage}>
                    <button type="button" className="messages-thread-icon-btn" disabled>
                      <FaSmile size={14} />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      placeholder="Message..."
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="messages-thread-send-btn"
                      disabled={sending || !messageText.trim()}
                    >
                      <FaPaperPlane size={13} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="messages-thread-empty full">Select a conversation to start chatting.</div>
              )}
              </div>
            )}
          </div>
        ) : (
          <div className="messages-hub-list">
            {groupChats.length === 0 ? (
              <div className="messages-hub-empty">
                <FaUsers size={18} />
                <p>No group chats yet</p>
                <span>Join an event to unlock its group chat.</span>
              </div>
            ) : (
              groupChats.map((event) => (
                <button
                  key={event._id}
                  className="messages-hub-card"
                  onClick={() => navigate(`/events/${event._id}/chat`)}
                >
                  <div className="messages-hub-avatar group">
                    <FaUsers size={16} />
                  </div>
                  <div className="messages-hub-card-content">
                    <p className="messages-hub-card-title">{event.title}</p>
                    <p className="messages-hub-card-subtitle">{event.participants?.length || 0} member{(event.participants?.length || 0) !== 1 ? 's' : ''}</p>
                    <div className="messages-hub-meta">
                      <span><FaClock size={11} /> {formatEventTime(event.startTime)}</span>
                    </div>
                  </div>
                  <FaArrowRight className="messages-hub-arrow" size={13} />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
