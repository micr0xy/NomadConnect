import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import './App.css'
import Navbar from './components/Navbar'
import ProtectedLayout from './components/ProtectedLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import EventsPage from './pages/EventsPage'
import EventChatPage from './pages/EventChatPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import MessagesPage from './pages/MessagesPage'
import useAuthStore from './store/authStore'

function AppContent() {
  const location = useLocation()
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth)

  // Check if user is authenticated on app load
  useEffect(() => {
    if (isHydrated && !hasCheckedAuth) {
      checkAuth()
    }
  }, [checkAuth, isHydrated, hasCheckedAuth])

  // Determine if current route is protected
  const protectedRoutes = ['/events', '/dashboard', '/profile', '/admin', '/messages']
  const isProtectedRoute = protectedRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  )
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(location.pathname)
  const shouldShowNavbar = !isProtectedRoute && location.pathname !== '/' && !isAuthRoute

  return (
    <div className="app-wrapper">
      {shouldShowNavbar && <Navbar />}
      <div className={`app-content ${isProtectedRoute ? 'protected' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LandingPage />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginPage />
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SignupPage />
              </motion.div>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EventsPage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/chat"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EventChatPage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DashboardPage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfilePage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:profileEmail"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProfilePage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminPage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:groupId"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessagesPage />
                  </motion.div>
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
      </div>
    </div>
  )
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!googleClientId) {
    return (
      <Router>
        <AppContent />
      </Router>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
