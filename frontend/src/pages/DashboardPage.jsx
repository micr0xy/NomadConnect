import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaUsers, FaArrowRight, FaCompass, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa'
import { listEvents } from '../services/eventsApi'
import useAuthStore from '../store/authStore'
import './DashboardPage.css'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    joinedEvents: 0,
    upcomingEvents: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const fetchedEvents = await listEvents()
      setEvents(fetchedEvents)
      
      const now = new Date()
      const normalizedUserEmail = (user?.email || '').toLowerCase()
      const joined = fetchedEvents.filter((e) => {
        const isParticipant = e.participants?.some(
          (p) => (p.userEmail || '').toLowerCase() === normalizedUserEmail
        )
        const isCreator = (e.createdByEmail || '').toLowerCase() === normalizedUserEmail
        return isParticipant || isCreator
      })
      const upcoming = fetchedEvents.filter(e => new Date(e.startTime) > now)
      
      setMyEvents(joined)
      setStats({
        totalEvents: fetchedEvents.length,
        joinedEvents: joined.length,
        upcomingEvents: upcoming.length
      })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatEventTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  const CATEGORY_ICONS = {
    meetup: '🤝', travel: '✈️', adventure: '⛺',
    cultural: '🎭', food: '🍜', sports: '⚽', other: '📌',
  }

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: <FaCompass size={22} />, color: '#3aad52', bg: 'rgba(58,173,82,0.12)' },
    { label: 'Joined Events', value: stats.joinedEvents, icon: <FaUsers size={22} />, color: '#7ab860', bg: 'rgba(122,184,96,0.12)' },
    { label: 'Upcoming', value: stats.upcomingEvents, icon: <FaCalendar size={22} />, color: '#d4943a', bg: 'rgba(212,148,58,0.12)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="dashboard-page"
    >
      {/* ── Top header ── */}
      <div className="dashboard-header">
        <div className="dash-header-left">
          <div className="dash-avatar">
            {user?.profileImage
              ? <img src={user.profileImage} alt={user.firstName} className="dash-avatar-img" />
              : <span className="dash-avatar-initials">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
            }
          </div>
          <div>
            <p className="dash-greeting">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</p>
            <h1 className="dash-name">{user?.firstName} {user?.lastName}</h1>
          </div>
        </div>
        <button onClick={() => navigate('/events')} className="dash-explore-btn">
          <FaLeaf size={14} />
          Explore Events
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className="stat-card"
          >
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{card.label}</p>
              <h3 className="stat-value">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/events')} className="action-card">
            <div className="action-icon"><FaCompass size={22} /></div>
            <div className="action-content">
              <h3>Browse Map</h3>
              <p>Drop a pin or find nearby events</p>
            </div>
            <FaArrowRight className="action-arrow" size={16} />
          </button>
          <button onClick={() => navigate('/profile')} className="action-card">
            <div className="action-icon" style={{ background: 'rgba(122,184,96,0.15)', color: '#7ab860' }}><FaMapMarkerAlt size={22} /></div>
            <div className="action-content">
              <h3>Edit Profile</h3>
              <p>Update your travel style & bio</p>
            </div>
            <FaArrowRight className="action-arrow" size={16} />
          </button>
        </div>
      </div>

      {/* ── Activity list (inspired by reference image) ── */}
      <div className="recent-section">
        <div className="recent-section-header">
          <h2>Recent Events</h2>
          <button onClick={() => navigate('/events')} className="see-all-btn">See all →</button>
        </div>

        {loading ? (
          <div className="loading-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : events.length > 0 ? (
          <div className="activity-list">
            {events.slice(0, 6).map((event, idx) => {
              const isJoined = myEvents.some(e => e._id === event._id)
              return (
                <motion.button
                  key={event._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate('/events')}
                  className={`activity-row ${isJoined ? 'activity-row-active' : ''}`}
                >
                  <div className="activity-icon">
                    {CATEGORY_ICONS[event.category] || '📌'}
                  </div>
                  <div className="activity-info">
                    <p className="activity-title">{event.title}</p>
                    <p className="activity-meta">{formatEventTime(event.startTime)} · {event.participants?.length || 0} participants</p>
                  </div>
                  <div className="activity-right">
                    {isJoined && <span className="joined-badge">Joined</span>}
                    <span className="event-badge">{event.category || 'other'}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <p>No events yet. Start exploring now!</p>
            <button onClick={() => navigate('/events')} className="empty-action">
              Browse Events
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
