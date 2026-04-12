import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { jwtDecode } from 'jwt-decode'
import Logo from '../components/Logo'

export default function LoginPage() {
  const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, googleAuth, user, isAuthenticated, error: storeError, clearError } = useAuthStore()

  // Display store errors
  useEffect(() => {
    if (storeError) {
      setError(storeError)
      clearError()
    }
  }, [storeError, clearError])

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = user?.role === 'admin' ? '/admin' : '/events'
    }
  }, [isAuthenticated, user?.role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      setIsLoading(false)
      return
    }

    try {
      await login(email, password)
      window.location.href = '/events'
    } catch (err) {
      // Error is already set by the effect watching storeError
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setIsLoading(true)

    try {
      const decoded = jwtDecode(credentialResponse.credential)
      
      await googleAuth(
        decoded.sub, // googleId
        decoded.email,
        decoded.given_name,
        decoded.family_name,
        decoded.picture
      )
      window.location.href = '/events'
    } catch (err) {
      // Error is already set by the effect watching storeError
      console.error('Google login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a1a0d' }}>
      {/* ── Left panel: nature photo ── */}
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
          <p className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Nature · Community · Adventure</p>
          <h2 className="font-display text-5xl font-bold text-white leading-[1.05] mb-5">
            Where wild<br />paths cross.
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-xs">
            Join thousands of nature nomads finding events, trails, and people worth knowing.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['🧗','🏕️','🌿'].map((e, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-forest-800 border-2 border-forest-600 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <p className="text-white/50 text-sm">1,200+ nomads already exploring</p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12" style={{ background: '#0f2d14' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <Logo className="w-8 h-8 text-forest-400" />
            <span className="font-display text-lg font-semibold text-white">NOMAD CONNECT</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-forest-400/70 text-sm">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/25 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(58,173,82,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(58,173,82,0.2)'}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-forest-400/60 tracking-wider uppercase">Password</label>
                <a href="#" className="text-xs text-forest-500 hover:text-forest-400 transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl text-white placeholder-forest-600 outline-none transition-all text-sm"
                style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(58,173,82,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(58,173,82,0.2)'}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: isLoading ? '#2d8a40' : 'linear-gradient(135deg, #2d8a40, #3aad52)' }}
            >
              {isLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(58,173,82,0.15)' }} />
            <span className="text-forest-600 text-xs tracking-widest">OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(58,173,82,0.15)' }} />
          </div>

          {isGoogleEnabled ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-forest-300 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                  style={{ background: 'rgba(10,26,13,0.5)', border: '1px solid rgba(58,173,82,0.2)' }}
                >
                  <span className="text-base">🌿</span>
                  Continue with Google
                </button>
              )}
            />
          ) : (
            <p className="text-center text-forest-600 text-xs">Google login is temporarily unavailable</p>
          )}

          <p className="mt-8 text-center text-forest-600 text-sm">
            New to NOMAD CONNECT?{' '}
            <a href="/signup" className="text-forest-400 font-semibold hover:text-forest-300 transition-colors">
              Create account
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
