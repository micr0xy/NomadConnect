import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome, {user?.firstName}!</h1>

          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Profile Image */}
              <div className="flex justify-center items-center">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="w-32 h-32 rounded-full shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-4xl text-white font-bold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Full Name</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-xl font-semibold text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Auth Provider</p>
                  <p className="text-xl font-semibold text-gray-900 capitalize">
                    {user?.authProvider || 'Email'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Member Since</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user?.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bio</h2>
              <p className="text-gray-600 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Account is Secure</h3>
          <p className="text-blue-800">
            Your authentication token is stored securely in an httpOnly cookie. You're protected against XSS and CSRF attacks.
          </p>
        </div>
      </div>
    </div>
  )
}
