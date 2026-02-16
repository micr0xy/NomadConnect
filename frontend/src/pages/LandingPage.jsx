import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FaMapMarkerAlt, FaUsers, FaUserCircle, FaUserPlus, FaMap, FaHandshake, FaArrowRight } from 'react-icons/fa'
import Logo from '../components/Logo'

// Animated Feature Section Component
function FeatureSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Connect
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple tools to bring nomads together across Nepal's most beautiful destinations.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-nomad-orange-100 rounded-xl flex items-center justify-center mb-6">
              <FaMapMarkerAlt className="w-7 h-7 text-nomad-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Events on the Map</h3>
            <p className="text-gray-600 leading-relaxed">
              Pin a location in Nepal and invite others to join your adventure — from Pokhara lakeside hikes to Kathmandu rooftop gatherings.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-nomad-orange-100 rounded-xl flex items-center justify-center mb-6">
              <FaUsers className="w-7 h-7 text-nomad-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Crew</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse upcoming events near you and connect with like-minded travelers who share your passion for exploration.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-nomad-orange-100 rounded-xl flex items-center justify-center mb-6">
              <FaUserCircle className="w-7 h-7 text-nomad-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Your Profile</h3>
            <p className="text-gray-600 leading-relaxed">
              Showcase your travel story, interests, and past adventures. Let others know who they're exploring with.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Animated How It Works Section Component
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stepVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-stone-50 to-nomad-orange-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-nomad-orange-600 max-w-2xl mx-auto">
            Three simple steps to go from solo traveler to part of a community.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="grid md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <motion.div
            custom={0}
            variants={stepVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-center"
          >
            <div className="w-20 h-20 bg-nomad-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaUserPlus className="w-10 h-10 text-nomad-orange-600" />
            </div>
            <div className="text-nomad-orange-600 font-bold text-sm mb-3">Step 01</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Profile</h3>
            <p className="text-gray-600 leading-relaxed">
              Sign up and set up your nomad profile — share where you've been and where you're headed.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            custom={1}
            variants={stepVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-center"
          >
            <div className="w-20 h-20 bg-nomad-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaMap className="w-10 h-10 text-nomad-orange-600" />
            </div>
            <div className="text-nomad-orange-600 font-bold text-sm mb-3">Step 02</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create or Browse Events</h3>
            <p className="text-gray-600 leading-relaxed">
              Pin an event on the map or explore what other travelers have planned nearby.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            custom={2}
            variants={stepVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-center"
          >
            <div className="w-20 h-20 bg-nomad-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaHandshake className="w-10 h-10 text-nomad-orange-600" />
            </div>
            <div className="text-nomad-orange-600 font-bold text-sm mb-3">Step 03</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect & Explore</h3>
            <p className="text-gray-600 leading-relaxed">
              Join events, meet your crew, and explore Nepal together — no more solo wandering.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleWaitlistSubmit = (e) => {
    e.preventDefault()
    // Handle waitlist submission
    console.log('Waitlist email:', email)
    alert('Thanks for joining the waitlist!')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">{/* Background decoration */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-0 right-0 w-96 h-96 bg-nomad-orange-100/30 rounded-full filter blur-3xl -z-10"
        ></motion.div>
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-nomad-orange-200/20 rounded-full filter blur-3xl -z-10"
        ></motion.div>

        <div className="max-w-7xl mx-auto text-center">
          {/* Subtitle with icon */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center space-x-2 text-nomad-orange-600 mb-6"
          >
            <FaMapMarkerAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Discover events across Nepal</span>
          </motion.div>

          {/* Main Heading with parallax effect */}
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
          >
            Explore Nepal <span className="text-nomad-orange-600">Together</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Create events on a map, meet fellow nomads, and turn solo adventures<br className="hidden sm:block" />
            into shared memories across the Himalayas.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="px-8 py-4 bg-nomad-orange-600 text-white rounded-full font-semibold text-lg hover:bg-nomad-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 group"
            >
              <FaMapMarkerAlt className="w-5 h-5" />
              <span>Create an Event</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all shadow-md border border-gray-200 flex items-center space-x-2"
            >
              <FaUsers className="w-5 h-5" />
              <span>Browse Events</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-nomad-orange-600 to-nomad-orange-700 rounded-3xl p-12 sm:p-16 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Connect with Fellow Nomads?
            </h2>
            <p className="text-nomad-orange-100 text-lg mb-8">
              Join the waitlist and be the first to explore Nepal with your new crew.
            </p>

            {/* Email Form */}
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nomad-orange-300 bg-white/90"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-nomad-teal-500 to-nomad-teal-600 text-white rounded-full font-semibold hover:from-nomad-teal-600 hover:to-nomad-teal-700 transition-all shadow-lg flex items-center justify-center space-x-2 group"
              >
                <span>Join Waitlist</span>
                <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FullScreenFooter />
    </div>
  )
}

// Full-Screen Footer Component
function FullScreenFooter() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  return (
    <footer ref={ref} className="min-h-screen relative overflow-hidden flex  bg-nomad-orange-600 items-center justify-center">
      {/* Animated gradient background */}
      <motion.div
        animate={{
          background: isInView
            ? 'linear-gradient(135deg, #ea580c 0%, #f97316 25%, #14b8a6 75%, #0d9488 100%)'
            : 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #14b8a6 100%)'
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 -z-10"
      />

      {/* Decorative blobs */}
      <motion.div
        animate={{
          scale: isInView ? [1, 1.2, 1] : 1,
          rotate: isInView ? [0, 180, 360] : 0,
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"
      />
      <motion.div
        animate={{
          scale: isInView ? [1, 1.3, 1] : 1,
          rotate: isInView ? [360, 180, 0] : 0,
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full filter blur-3xl"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Logo className="w-16 h-16 text-white" />
            <span className="text-3xl font-bold text-white">NOMAD CONNECT</span>
          </div>

          {/* Tagline */}
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Your Journey, Our Community
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Connecting nomads across Nepal, one adventure at a time. Join us in creating unforgettable experiences.
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6 mb-12">
            <a
              href="#"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-white/90">
            <a href="#" className="hover:text-white transition-colors font-medium">About Us</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Contact</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Blog</a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/20 mb-8"></div>

          {/* Copyright */}
          <p className="text-white/70 text-sm">
            © 2026 Nomad Connect. Crafted with ❤️ for adventurers everywhere.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
