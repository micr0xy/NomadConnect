import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaSignOutAlt, FaEdit } from 'react-icons/fa'
import useAuthStore from '../store/authStore'
import Map from '../components/Map'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  // Sample markers for demonstration (in future, these would come from events)
  const sampleMarkers = [
    {
      id: 1,
      position: [27.7172, 85.3240],
      title: 'Kathmandu Durbar Square',
      description: 'Meetup at the historic heart of Kathmandu',
      popup: true,
    },
    {
      id: 2,
      position: [27.7089, 85.3206],
      title: 'Thamel',
      description: 'Evening coffee and chat',
      popup: true,
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden bg-stone-50">
      {/* Main Map Area - 80% width */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-4"
      >
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          <Map
            showUserLocation={true}
            markers={sampleMarkers}
            height="100%"
          />
        </div>
      </motion.div>

      {/* Right Sidebar - Fixed width */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto"
      >
        {/* User Profile Section */}
        <div className="p-6 bg-gradient-to-br from-nomad-orange-50 to-nomad-teal-50">
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.firstName}
                className="w-24 h-24 rounded-full shadow-lg object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nomad-orange-600 to-nomad-orange-700 flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-3xl text-white font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* User Name */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            {user?.authProvider === 'google' ? 'Google User' : 'Email User'}
          </p>

          {/* Edit Profile Button */}
          <button className="w-full px-4 py-2 bg-white text-nomad-orange-600 rounded-lg font-semibold hover:bg-nomad-orange-50 transition duration-200 flex items-center justify-center gap-2 shadow-sm border border-nomad-orange-200">
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Details */}
        <div className="flex-1 p-6 space-y-4">
          {/* Email */}
          <div className="flex items-start space-x-3">
            <FaEnvelope className="w-5 h-5 text-nomad-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-900 font-medium break-all">{user?.email}</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start space-x-3">
            <FaCalendar className="w-5 h-5 text-nomad-teal-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(user?.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="flex items-start space-x-3">
              <FaUser className="w-5 h-5 text-nomad-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Activity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-nomad-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-nomad-orange-600">0</p>
                <p className="text-xs text-gray-600">Events Created</p>
              </div>
              <div className="bg-nomad-teal-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-nomad-teal-600">0</p>
                <p className="text-xs text-gray-600">Events Joined</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            
            <button className="w-full px-4 py-2.5 bg-nomad-teal-500 text-white rounded-lg font-semibold hover:bg-nomad-teal-600 transition duration-200 flex items-center justify-center gap-2">
              <FaMapMarkerAlt />
              <span>Create Event</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 bg-sunset-600 text-white rounded-lg font-semibold hover:bg-sunset-700 transition duration-200 flex items-center justify-center gap-2"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your account is secure with httpOnly cookies
          </p>
        </div>
      </motion.aside>
    </div>
  )
}
