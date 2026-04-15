import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBars, FaTimes, FaCalendar, FaUser, FaSignOutAlt, FaHome, FaChevronDown, FaChevronUp, FaShieldAlt } from 'react-icons/fa'
import { BiMessageRounded } from 'react-icons/bi'
import { MdOutlinePersonAdd, MdChat } from 'react-icons/md'
import useAuthStore from '../store/authStore'
import { listEvents } from '../services/eventsApi'
import Logo from './Logo'
import './Sidebar.css'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isChatsOpen, setIsChatsOpen] = useState(false)
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isEventsPage = location.pathname === '/events'

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch participated events on page load
  useEffect(() => {
    const fetchParticipatedEvents = async () => {
      try {
        setLoadingChats(true)
        const events = await listEvents()
        const normalizedUserEmail = (user?.email || '').toLowerCase()
        const userParticipated = events.filter((event) => {
          const isParticipant = event.participants?.some(
            (p) => (p.userEmail || '').toLowerCase() === normalizedUserEmail
          )
          const isCreator = (event.createdByEmail || '').toLowerCase() === normalizedUserEmail
          return isParticipant || isCreator
        })
        setParticipatedEvents(userParticipated)
      } catch (error) {
        console.error('Error fetching participated events:', error)
      } finally {
        setLoadingChats(false)
      }
    }

    if (user?.email) {
      fetchParticipatedEvents()
    }
  }, [user?.email])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [location.pathname, isMobile])

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(isEventsPage)
    }
  }, [isEventsPage, isMobile])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    {
      icon: <FaHome size={20} />,
      label: 'Dashboard',
      path: '/dashboard',
      badge: null
    },
    {
      icon: <FaCalendar size={20} />,
      label: 'Events',
      path: '/events',
      badge: null
    },
    {
      icon: <BiMessageRounded size={20} />,
      label: 'Messages',
      path: '/messages',
      badge: null
    }
  ]

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  return (
    <>
      {!isMobile && !isEventsPage && !isOpen && (
        <div
          className="sidebar-hover-zone"
          onMouseEnter={() => setIsOpen(true)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Button */}
      <motion.button
        initial={{ rotateY: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="sidebar-mobile-toggle"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </motion.button>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        exit="exit"
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        onMouseEnter={() => {
          if (!isMobile && !isEventsPage) setIsOpen(true)
        }}
        onMouseLeave={() => {
          if (!isMobile && !isEventsPage) setIsOpen(false)
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button onClick={() => navigate('/events')} className="sidebar-logo">
            <Logo className="w-8 h-8 text-forest-400" />
            <span className="sidebar-brand">NOMAD</span>
          </button>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="sidebar-user-section">
          <div className="sidebar-user-avatar">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.firstName}
                className="sidebar-user-image"
              />
            ) : (
              <div className="sidebar-user-placeholder">
                <span>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.firstName} {user?.lastName}</p>
            <p className="sidebar-user-email">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <p className="sidebar-nav-title">MAIN</p>
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => { navigate(item.path); if (isMobile) setIsOpen(false) }}
                    className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Group Chats Section */}
          <div className="sidebar-nav-section">
            <button
              onClick={() => setIsChatsOpen(!isChatsOpen)}
              className={`sidebar-nav-section-header ${isChatsOpen ? 'expanded' : ''}`}
            >
              <div className="sidebar-section-label">
                <span className="sidebar-section-icon">
                  <BiMessageRounded size={16} />
                </span>
                <div className="sidebar-section-copy">
                  <span className="sidebar-section-title">Group chats</span>
                  <span className="sidebar-section-subtitle">
                    {participatedEvents.length} active conversation{participatedEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="sidebar-section-meta">
                <span className="sidebar-badge flex-shrink-0">
                  {participatedEvents.length}
                </span>
                <motion.div 
                  animate={{ rotate: isChatsOpen ? 180 : 0 }} 
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  {isChatsOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </motion.div>
              </div>
            </button>

            {isChatsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="sidebar-chats-list"
              >
                {loadingChats ? (
                  <div className="sidebar-chats-empty">
                    Loading chats...
                  </div>
                ) : participatedEvents.length === 0 ? (
                  <div className="sidebar-chats-empty">
                    <MdOutlinePersonAdd size={18} />
                    <span>No group chats yet</span>
                  </div>
                ) : (
                  participatedEvents.map((event) => (
                    <motion.button
                      key={event._id}
                      onClick={() => {
                        navigate(`/events/${event._id}/chat`)
                        if (isMobile) setIsOpen(false)
                      }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`sidebar-chat-item ${
                        location.pathname === `/events/${event._id}/chat`
                          ? 'text-white'
                          : 'text-forest-300 hover:text-forest-200'
                      }`}
                      style={{
                        background: location.pathname === `/events/${event._id}/chat`
                          ? 'rgba(58,173,82,0.25)'
                          : 'rgba(12, 28, 18, 0.45)',
                        border: `1px solid ${location.pathname === `/events/${event._id}/chat` ? 'rgba(58,173,82,0.45)' : 'rgba(58,173,82,0.14)'}`,
                      }}
                    >
                      <div className="sidebar-chat-icon">
                        <MdChat size={18} className="flex-shrink-0" />
                      </div>
                      <div className="sidebar-chat-copy">
                        <p className="sidebar-chat-title">
                          {event.title}
                        </p>
                        <p className="sidebar-chat-meta">
                          {event.participants?.length || 0} member{(event.participants?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Divider */}
          <div className="sidebar-divider" />

          {/* Footer Section */}
          <div className="sidebar-nav-section">
            <p className="sidebar-nav-title">ACCOUNT</p>
            <ul>
              <li>
                <button
                  onClick={() => { navigate('/profile'); if (isMobile) setIsOpen(false) }}
                  className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
                >
                  <span className="sidebar-nav-icon"><FaUser size={20} /></span>
                  <span className="sidebar-nav-label">Profile</span>
                </button>
              </li>
              {user?.role === 'admin' && (
                <li>
                  <button
                    onClick={() => { navigate('/admin'); if (isMobile) setIsOpen(false) }}
                    className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
                  >
                    <span className="sidebar-nav-icon"><FaShieldAlt size={20} /></span>
                    <span className="sidebar-nav-label">Admin</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="sidebar-nav-item logout-btn"
                >
                  <span className="sidebar-nav-icon"><FaSignOutAlt size={20} /></span>
                  <span className="sidebar-nav-label">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <p className="text-xs" style={{ color: 'rgba(58,173,82,0.35)' }}>© 2026 NOMAD CONNECT</p>
        </div>
      </motion.div>
    </>
  )
}
