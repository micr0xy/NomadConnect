import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import useAuthStore from '../store/authStore'
import NotificationIcon from './NotificationIcon'
import Logo from './Logo'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-forest-950/95 backdrop-blur-md border-b border-forest-800/60 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center gap-2.5 text-white">
            <Logo className="w-7 h-7 text-forest-400" />
            <span className="font-display text-lg font-semibold tracking-tight">NOMAD CONNECT</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-forest-300/80 hover:text-forest-300 transition-colors text-sm font-medium">Home</a>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-5">
                <a href="/events" className="text-forest-300/80 hover:text-forest-300 transition-colors text-sm font-medium">Explore</a>
                <NotificationIcon />
                <a href="/dashboard" className="flex items-center gap-2 text-forest-300/80 hover:text-forest-300 transition-colors">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} className="w-8 h-8 rounded-full object-cover border-2 border-forest-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-forest-700 border-2 border-forest-600 flex items-center justify-center">
                      <span className="text-forest-200 font-bold text-xs">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium">{user?.firstName}</span>
                </a>
                <button onClick={handleLogout} className="text-forest-400/70 hover:text-forest-400 text-sm font-medium transition-colors">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href="/login" className="text-forest-300/80 hover:text-forest-300 transition-colors text-sm font-medium px-3 py-1.5">Log in</a>
                <a href="/signup" className="bg-forest-500 hover:bg-forest-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-lg shadow-forest-950/50">Join Free</a>
              </div>
            )}
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-forest-300 hover:text-white transition-colors">
            {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-forest-900 border-t border-forest-800/60 overflow-hidden"
          >
            <div className="px-5 py-4 space-y-1">
              <a href="/" className="block px-3 py-2.5 text-forest-300/80 hover:text-white hover:bg-forest-800/60 rounded-lg transition-colors text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Home</a>
              {isAuthenticated && user ? (
                <>
                  <a href="/events" className="block px-3 py-2.5 text-forest-300/80 hover:text-white hover:bg-forest-800/60 rounded-lg transition-colors text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Explore</a>
                  <a href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-forest-300/80 hover:text-white hover:bg-forest-800/60 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.firstName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-forest-700 flex items-center justify-center">
                        <span className="text-forest-200 font-bold text-xs">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">Profile</span>
                  </a>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-forest-400/70 hover:text-forest-400 hover:bg-forest-800/60 rounded-lg text-sm font-medium transition-colors">Logout</button>
                </>
              ) : (
                <div className="space-y-2 pt-2 border-t border-forest-800/60">
                  <a href="/login" className="block px-3 py-2.5 text-center text-forest-300 border border-forest-700 rounded-xl text-sm font-medium hover:bg-forest-800/60 transition-colors" onClick={() => setIsMenuOpen(false)}>Log in</a>
                  <a href="/signup" className="block px-3 py-2.5 text-center bg-forest-500 hover:bg-forest-400 text-white rounded-xl text-sm font-semibold transition-colors" onClick={() => setIsMenuOpen(false)}>Join Free</a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
