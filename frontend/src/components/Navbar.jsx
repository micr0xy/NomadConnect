import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import useAuthStore from '../store/authStore'
import Logo from './Logo'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="w-8 h-8 text-nomad-orange-600" />
            <span className="text-xl font-bold text-gray-900">NOMAD CONNECT</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-nomad-orange-600 transition-colors font-medium">
              Home
            </Link>
            {/* <a href="/#features" className="text-gray-700 hover:text-nomad-orange-600 transition-colors font-medium">
              Features
            </a>
            <a href="/#how-it-works" className="text-gray-700 hover:text-nomad-orange-600 transition-colors font-medium">
              About
            </a> */}

            {isAuthenticated && user ? (
              // User is logged in - Show profile icon/dropdown
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-nomad-orange-600 transition-colors"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-nomad-orange-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nomad-orange-600 to-nomad-orange-700 flex items-center justify-center border-2 border-nomad-orange-200">
                      <span className="text-white font-bold text-xs">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">{user?.firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-nomad-orange-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              // User is not logged in - Show login/signup buttons
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-nomad-orange-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-nomad-orange-600 text-white rounded-full font-semibold hover:bg-nomad-orange-700 transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-nomad-orange-600 transition-colors"
          >
            {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-t border-stone-200"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:text-nomad-orange-600 hover:bg-nomad-orange-50 rounded-lg transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="/#features"
              className="block px-3 py-2 text-gray-700 hover:text-nomad-orange-600 hover:bg-nomad-orange-50 rounded-lg transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className="block px-3 py-2 text-gray-700 hover:text-nomad-orange-600 hover:bg-nomad-orange-50 rounded-lg transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-nomad-orange-600 hover:bg-nomad-orange-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.firstName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nomad-orange-600 to-nomad-orange-700 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span>Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-nomad-orange-600 hover:bg-nomad-orange-50 rounded-lg transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-center text-gray-700 hover:text-nomad-orange-600 border border-nomad-orange-600 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-center bg-nomad-orange-600 text-white rounded-lg font-semibold hover:bg-nomad-orange-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
