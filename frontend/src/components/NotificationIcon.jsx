import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa'
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from '../services/notificationsApi'
import { followUser, unfollowUser } from '../services/profileApi'
import './NotificationIcon.css'

export default function NotificationIcon() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [redirectingId, setRedirectingId] = useState('')
  const [followActionLoadingIds, setFollowActionLoadingIds] = useState({})

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotifications(20, 0)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProfileRouteFromNotification = (notif) => {
    const senderEmail = notif?.senderId?.email
    if (senderEmail) {
      return `/profile/${encodeURIComponent(String(senderEmail).toLowerCase())}`
    }
    return '/profile'
  }

  const handleNotificationClick = async (notif) => {
    if (!notif?._id) {
      return
    }

    setRedirectingId(notif._id)

    if (!notif.isRead) {
      try {
        await markAsRead(notif._id)
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }

    window.setTimeout(() => {
      if (notif.type !== 'announcement') {
        navigate(getProfileRouteFromNotification(notif))
      }
      setIsOpen(false)
      setRedirectingId('')
    }, 220)
  }

  const handleFollowToggle = async (notif) => {
    if (!notif?._id || !notif?.senderId?._id) {
      return
    }

    setFollowActionLoadingIds((prev) => ({
      ...prev,
      [notif._id]: true,
    }))

    try {
      if (notif.isFollowingSender) {
        await unfollowUser(notif.senderId._id)
      } else {
        await followUser(notif.senderId._id)
      }

      setNotifications((prev) =>
        prev.map((n) => (
          n._id === notif._id
            ? {
              ...n,
              isFollowingSender: !Boolean(n.isFollowingSender),
            }
            : n
        ))
      )
    } catch (error) {
      console.error('Failed to update follow status:', error)
    } finally {
      setFollowActionLoadingIds((prev) => ({
        ...prev,
        [notif._id]: false,
      }))
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <div className="notification-icon-wrapper">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <FaBell size={18} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-header-actions">
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  className="notification-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="notification-list">
              {loading && <p className="notification-loading">Loading...</p>}
              {!loading && notifications.length === 0 && (
                <p className="notification-empty">No notifications yet</p>
              )}

              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.type === 'announcement' ? 'announcement-item' : ''} ${!notif.isRead ? 'unread' : ''} ${redirectingId === notif._id ? 'redirecting' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {notif.type !== 'announcement' && (
                    <div className="notification-avatar">
                      {notif.senderId?.profileImage ? (
                        <img src={notif.senderId.profileImage} alt="User" />
                      ) : (
                        <div className="avatar-placeholder">
                          {notif.senderId?.firstName?.charAt(0)}
                          {notif.senderId?.lastName?.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="notification-content">
                    {notif.type === 'announcement' ? (
                      <>
                        <p className="announcement-title">{notif.title || 'Update'}</p>
                        <p className="announcement-message">{notif.message}</p>
                        {notif.imageUrl && (
                          <img
                            src={notif.imageUrl}
                            alt={notif.title || 'Announcement image'}
                            className="announcement-image"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {notif.title && <p className="notification-time">{notif.title}</p>}
                        <p className="notification-message">
                          <strong>{notif.senderId?.firstName}</strong> {notif.message}
                        </p>
                        <p className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}

                    {notif.type === 'follow' && (
                      <button
                        className="follow-back-btn"
                        disabled={Boolean(followActionLoadingIds[notif._id])}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowToggle(notif)
                        }}
                      >
                        {followActionLoadingIds[notif._id]
                          ? 'Following...'
                          : notif.isFollowingSender
                            ? 'Following'
                            : notif.isFollowedBySender
                              ? 'Follow Back'
                              : 'Follow'}
                      </button>
                    )}
                  </div>

                  {notif.type !== 'announcement' && (
                    <button
                      className="notification-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notif._id)
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
