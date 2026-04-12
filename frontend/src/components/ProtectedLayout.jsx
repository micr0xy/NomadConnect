import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import NotificationIcon from './NotificationIcon'
import './ProtectedLayout.css'

export default function ProtectedLayout({ children }) {
  const location = useLocation()
  const hideNotifications =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/messages') ||
    (location.pathname.startsWith('/events/') && location.pathname.endsWith('/chat'))

  return (
    <div className="protected-layout">
      <Sidebar />
      <main className="protected-main-content">
        {!hideNotifications && (
          <div className="protected-header-notifications">
            <NotificationIcon />
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
