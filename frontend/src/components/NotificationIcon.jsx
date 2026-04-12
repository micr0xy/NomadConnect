import { useEffect, useState } from 'react'
import { FaBell } from 'react-icons/fa'
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from '../services/notificationsApi'
import { followUser } from '../services/profileApi'
import './NotificationIcon.css'

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const handleNotificationClick = async (notif) => {
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
  }

  const handleFollowBack = async (notif) => {
    try {
      await followUser(notif.senderId._id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, actionPerformed: true } : n))
      )
    } catch (error) {
      console.error('Failed to follow back:', error)
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
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-list">
              {loading && <p className="notification-loading">Loading...</p>}
              {!loading && notifications.length === 0 && (
                <p className="notification-empty">No notifications yet</p>
              )}

              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
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

                  <div className="notification-content">
                    <p className="notification-message">
                      <strong>{notif.senderId?.firstName}</strong> {notif.message}
                    </p>
                    <p className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>

                    {notif.type === 'follow' && !notif.actionPerformed && (
                      <button
                        className="follow-back-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowBack(notif)
                        }}
                      >
                        Follow Back
                      </button>
                    )}
                  </div>

                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotification(notif._id)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
