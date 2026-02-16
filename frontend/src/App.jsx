import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import './App.css'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import useAuthStore from './store/authStore'

function AppContent() {
  const location = useLocation()
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <Navbar />
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardPage />
                </motion.div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
