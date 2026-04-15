import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const targetEmail = String(email || '').trim().toLowerCase()

    if (!targetEmail) {
      setError('Please enter your registered email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(targetEmail)) {
      setError('Please enter a valid email.')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/api/auth/forgot-password', { email: targetEmail })
      setNotice(response?.data?.message || 'If the email is registered, a new password was sent.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to process forgot password request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a1a0d' }}>
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(10,26,13,0.7) 0%, rgba(30,107,46,0.3) 100%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <Logo className="w-9 h-9 text-forest-400" />
          <span className="font-display text-xl font-semibold text-white tracking-tight">NOMAD CONNECT</span>
        </div>
        <div className="relative z-10">
          <p className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Account Recovery</p>
          <h2 className="font-display text-5xl font-bold text-white leading-[1.05] mb-5">
            Reset access<br />with your email.
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-xs">
            Enter your registered email and we will send a new temporary password.
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
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Logo className="w-8 h-8 text-forest-400" />
            <span className="font-display text-lg font-semibold text-white">NOMAD CONNECT</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Forgot password</h1>
            <p className="text-forest-400/70 text-sm">Enter the email tied to your account</p>
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
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                onFocus={(event) => { event.target.style.borderColor = 'rgba(58,173,82,0.5)' }}
                onBlur={(event) => { event.target.style.borderColor = 'rgba(58,173,82,0.2)' }}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: loading ? '#2d8a40' : 'linear-gradient(135deg, #2d8a40, #3aad52)' }}
            >
              {loading ? 'Sending…' : 'Forgot password'}
            </button>
          </form>

          <div className="mt-8 text-center text-forest-600 text-sm">
            Remembered it?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-forest-400 font-semibold hover:text-forest-300 transition-colors">
              Back to login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}