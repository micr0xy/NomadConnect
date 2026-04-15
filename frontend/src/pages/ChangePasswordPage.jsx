import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaLock, FaShieldAlt, FaArrowLeft } from 'react-icons/fa'
import Logo from '../components/Logo'
import api from '../services/api'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    try {
      setLoading(true)
      const response = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      setNotice(response?.data?.message || 'Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#08130d' }}>
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(8,19,13,0.72) 0%, rgba(22,72,34,0.35) 100%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <Logo className="w-9 h-9 text-forest-400" />
          <span className="font-display text-xl font-semibold text-white tracking-tight">NOMAD CONNECT</span>
        </div>
        <div className="relative z-10">
          <p className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Account Security</p>
          <h2 className="font-display text-5xl font-bold text-white leading-[1.05] mb-5">
            Change your<br />password safely.
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-xs">
            Confirm your current password first, then set a new one for this account.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12" style={{ background: '#0f2d14' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <Logo className="w-8 h-8 text-forest-400" />
              <span className="font-display text-lg font-semibold text-white">NOMAD CONNECT</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs text-forest-400 hover:text-forest-300 transition-colors"
            >
              <FaArrowLeft size={12} />
              Back
            </button>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Change password</h1>
            <p className="text-forest-400/70 text-sm">Verify your old password before updating it</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/25 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            {notice && (
              <div className="bg-emerald-900/25 border border-emerald-700/40 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>✓</span> {notice}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Current password</label>
              <div className="relative">
                <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500" size={14} />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Enter current password"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">New password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500" size={14} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Confirm new password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-500" size={14} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: loading ? '#2d8a40' : 'linear-gradient(135deg, #2d8a40, #3aad52)' }}
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}