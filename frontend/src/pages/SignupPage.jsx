import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { jwtDecode } from 'jwt-decode'
import Logo from '../components/Logo'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup, googleAuth, isAuthenticated, error: storeError, clearError } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/events'
    }
  }, [isAuthenticated])

  // Display store errors
  useEffect(() => {
    if (storeError) {
      setError(storeError)
      clearError()
    }
  }, [storeError, clearError])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const normalizedFormData = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
    }

    // Validation
    if (!normalizedFormData.firstName || !normalizedFormData.lastName || !normalizedFormData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedFormData.email)) {
      setError('Please enter a valid email')
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      await signup(
        normalizedFormData.firstName,
        normalizedFormData.lastName,
        normalizedFormData.email,
        formData.password,
        formData.confirmPassword
      )
      window.location.href = '/events'
    } catch (err) {
      console.error('Signup error:', err)
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
      console.error('Google signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a1a0d' }}>
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(10,26,13,0.75) 0%, rgba(30,107,46,0.35) 100%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <Logo className="w-9 h-9 text-forest-400" />
          <span className="font-display text-xl font-semibold text-white tracking-tight">NOMAD CONNECT</span>
        </div>
        <div className="relative z-10">
          <p className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Your adventure awaits</p>
          <h2 className="font-display text-5xl font-bold text-white leading-[1.05] mb-5">
            Start your<br />journey today.
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-xs">
            Create your free profile and connect with nature nomads in your area.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto" style={{ background: '#0f2d14' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md py-8"
        >
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Logo className="w-8 h-8 text-forest-400" />
            <span className="font-display text-lg font-semibold text-white">NOMAD CONNECT</span>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Create account</h1>
            <p className="text-forest-400/70 text-sm">Join thousands of nature nomads worldwide</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/25 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">First</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={isLoading}
                  autoCapitalize="words" autoCorrect="off" spellCheck={false}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-forest-600 outline-none text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Last</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isLoading}
                  autoCapitalize="words" autoCorrect="off" spellCheck={false}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-forest-600 outline-none text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading}
                autoCapitalize="off" autoCorrect="off" spellCheck={false}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-forest-600 outline-none text-sm"
                style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-forest-600 outline-none text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Min 8 chars" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-400/60 mb-2 tracking-wider uppercase">Confirm</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-forest-600 outline-none text-sm"
                  style={{ background: 'rgba(10,26,13,0.6)', border: '1px solid rgba(58,173,82,0.2)' }}
                  placeholder="Repeat" />
              </div>
            </div>

            <label className="flex items-start gap-3 pt-1">
              <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} disabled={isLoading}
                className="w-4 h-4 mt-0.5 accent-forest-500 rounded" />
              <span className="text-sm text-forest-400/60">
                I agree to the{' '}
                <a href="#" className="text-forest-400 hover:text-forest-300">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-forest-400 hover:text-forest-300">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #2d8a40, #3aad52)' }}>
              {isLoading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(58,173,82,0.15)' }} />
            <span className="text-forest-600 text-xs tracking-widest">OR</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(58,173,82,0.15)' }} />
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            render={(renderProps) => (
              <button onClick={renderProps.onClick} disabled={renderProps.disabled || isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-forest-300 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{ background: 'rgba(10,26,13,0.5)', border: '1px solid rgba(58,173,82,0.2)' }}>
                <span className="text-base">🌿</span>
                Sign up with Google
              </button>
            )}
          />

          <p className="mt-7 text-center text-forest-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-forest-400 font-semibold hover:text-forest-300 transition-colors">Sign in</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

