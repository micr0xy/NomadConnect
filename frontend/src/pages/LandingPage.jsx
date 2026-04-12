import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FaArrowRight, FaLeaf, FaUsers, FaMapMarkedAlt, FaCompass } from 'react-icons/fa'
import Map from '../components/Map'
import Logo from '../components/Logo'

const demoEvents = [
  {
    _id: 'landing-event-1',
    title: 'Sunrise Ridge Hike',
    description: 'Chase the golden hour from the ridge with fellow trail wanderers.',
    category: 'adventure',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    participants: [{ userEmail: 'a@example.com' }, { userEmail: 'b@example.com' }, { userEmail: 'd@example.com' }],
    location: { coordinates: [85.324, 27.7172] },
  },
  {
    _id: 'landing-event-2',
    title: 'Forest Nomads Meetup',
    description: 'Coffee, maps, and stories from the road.',
    category: 'meetup',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    participants: [{ userEmail: 'c@example.com' }],
    location: { coordinates: [85.312, 27.705] },
  },
  {
    _id: 'landing-event-3',
    title: 'Riverside Camp Night',
    description: 'Campfire, stars, and river sounds.',
    category: 'travel',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    participants: [{ userEmail: 'e@example.com' }, { userEmail: 'f@example.com' }],
    location: { coordinates: [85.336, 27.725] },
  },
]

const MARQUEE_TEXT = [
  'TRAILS', 'SUMMITS', 'RIVERS', 'NOMADS', 'WILDERNESS', 'ADVENTURES',
  'FORESTS', 'CONNECT', 'EXPLORE', 'NATURE', 'PATHS', 'WANDERERS',
]

const features = [
  {
    icon: FaMapMarkedAlt,
    title: 'Discover Nature Events',
    desc: 'Find hikes, camps, river runs, and sunrise chases happening right now — plotted live on the map.',
    accent: '#3aad52',
    bg: '#0f2d14',
  },
  {
    icon: FaUsers,
    title: 'Meet Fellow Nomads',
    desc: 'Every trail is better shared. Connect with travelers who move through the world the same way you do.',
    accent: '#7ab860',
    bg: '#1a4522',
  },
  {
    icon: FaCompass,
    title: 'Drop a Pin, Start an Adventure',
    desc: 'See a great spot? Tap the map, name your adventure, and watch your crew arrive.',
    accent: '#d4943a',
    bg: '#2d1a08',
  },
]

const stats = [
  { value: '1,200+', label: 'Nature Nomads' },
  { value: '340+',   label: 'Events Created' },
  { value: '89',     label: 'Countries' },
  { value: '∞',      label: 'Memories' },
]

// Fade-up animation variant
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] } }),
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY     = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity  = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroScale    = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  const mapMarkers = demoEvents.map((e) => ({
    id: e._id,
    position: [e.location.coordinates[1], e.location.coordinates[0]],
    title: e.title,
    description: e.description,
    popup: true,
    event: e,
  }))

  return (
    <div className="bg-[#fdf8ee] overflow-x-hidden font-sans">

      {/* ═══ FIXED NAV ═══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5">
        <a href="/" className="flex items-center gap-2.5 text-white drop-shadow-md">
          <Logo className="w-9 h-9 text-white" />
          <span className="font-display text-xl font-semibold tracking-tight">NOMAD CONNECT</span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/login"  className="hidden sm:block text-white/90 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
            Log in
          </a>
          <a href="/signup" className="bg-forest-500 hover:bg-forest-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-forest-950/30">
            Join Free →
          </a>
        </div>
      </nav>

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden grain-overlay">
        {/* Parallax background */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: heroImgY, scale: heroScale }}>
          <img
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=85"
            alt="mountain vista"
            className="w-full h-full object-cover"
          />
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/20 to-forest-950/80" />
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 mb-8 tracking-wider">
              <FaLeaf className="text-forest-400" /> NATURE · NOMADS · COMMUNITY
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="font-display font-bold text-white leading-[0.88] tracking-tight"
            style={{ fontSize: 'clamp(3.2rem, 10vw, 9.5rem)' }}
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Where Wild<br />
            <em className="not-italic text-forest-400">Paths</em> Cross
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="mt-6 text-white/75 font-light max-w-lg leading-relaxed"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Find nature events, meet fellow wanderers, and create adventures<br className="hidden sm:block" /> that belong to the wild.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <a href="/signup" className="px-8 py-3.5 bg-forest-500 hover:bg-forest-600 text-white rounded-full font-semibold transition-all duration-200 shadow-xl shadow-forest-950/40 hover:scale-105 active:scale-100">
              Start Exploring
            </a>
            <a href="/login" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full font-semibold border border-white/25 transition-all duration-200 flex items-center gap-2">
              Log In <FaArrowRight size={12} />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <div className="w-5 h-9 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </div>
          <span className="text-white/40 text-[10px] tracking-widest font-medium">SCROLL</span>
        </motion.div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#1a4522" />
          </svg>
        </div>
      </section>

      {/* ═══ MARQUEE ═════════════════════════════════════════════════════════ */}
      <div className="bg-forest-800 py-4 overflow-hidden relative z-10">
        <div className="marquee-track whitespace-nowrap">
          {[...MARQUEE_TEXT, ...MARQUEE_TEXT].map((word, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-6 text-forest-300 text-xs font-bold tracking-[0.35em] uppercase">
              {word}
              <span className="text-forest-500 text-lg">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ MANIFESTO ═══════════════════════════════════════════════════════ */}
      <section className="bg-forest-800 py-24 px-6 sm:px-12 relative overflow-hidden">
        {/* bg leaf decoration */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 text-forest-700 opacity-20 pointer-events-none" style={{ fontSize: '28rem', lineHeight: 1 }}>
          🌿
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.p
            className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-8"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            Our Belief
          </motion.p>
          <motion.h2
            className="font-display text-white leading-tight"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5.5rem)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            Nature is better <em className="not-italic text-forest-400">shared.</em><br />
            We built the platform<br />for those who live by it.
          </motion.h2>
          <motion.div
            className="mt-10 w-24 h-1 bg-forest-500 rounded"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          />
          <motion.p
            className="mt-8 text-forest-200/70 max-w-xl font-light text-lg leading-relaxed"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
          >
            NOMAD CONNECT is where trail runners, mountaineers, van-lifers, and forest dwellers come together — one pin at a time.
          </motion.p>
        </div>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════════════════════════ */}
      <section className="bg-forest-950 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <p className="font-display text-forest-400 font-bold leading-none" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
                {s.value}
              </p>
              <p className="mt-2 text-forest-300/60 text-xs font-semibold tracking-widest uppercase">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="bg-[#fdf8ee] py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p className="text-forest-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            What you can do
          </motion.p>
          <motion.h2
            className="font-display text-center text-forest-950 leading-tight mb-16"
            style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            Built for the <em className="not-italic text-forest-600">restless soul</em>
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="rounded-3xl p-8 flex flex-col gap-5 hover:scale-[1.02] transition-transform duration-300 cursor-default"
                style={{ backgroundColor: f.bg }}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: f.accent + '22' }}>
                  <f.icon size={22} style={{ color: f.accent }} />
                </div>
                <h3 className="font-display text-white text-2xl font-semibold leading-tight">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MAP PREVIEW ═════════════════════════════════════════════════════ */}
      <section className="bg-forest-950 py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #3aad52 0%, transparent 60%)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.p className="text-forest-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Live Events
          </motion.p>
          <motion.h2
            className="font-display text-white text-center mb-10 leading-tight"
            style={{ fontSize: 'clamp(2rem,5vw,4rem)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            Adventures happening <em className="not-italic text-forest-400">right now</em>
          </motion.h2>

          <motion.div
            className="rounded-3xl overflow-hidden border border-forest-800 shadow-2xl shadow-forest-950"
            style={{ height: '420px' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          >
            <Map
              center={[27.7172, 85.324]}
              zoom={12}
              markers={mapMarkers}
              height="100%"
              showUserLocation={false}
              onMarkerClick={() => { window.location.href = '/login' }}
            />
          </motion.div>

          <motion.p className="text-center text-forest-300/50 text-sm mt-5 font-light"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
            Sign in to see events near you and drop your own pin.
          </motion.p>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="bg-[#fdf8ee] py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.p className="text-forest-600 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Getting started
          </motion.p>
          <motion.h2
            className="font-display text-forest-950 text-center mb-16 leading-tight"
            style={{ fontSize: 'clamp(2rem,5vw,3.8rem)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            Three steps to your<br /><em className="not-italic text-forest-600">next adventure</em>
          </motion.h2>

          <div className="flex flex-col sm:flex-row gap-10 sm:gap-6">
            {[
              { step: '01', icon: '🌿', title: 'Create your profile', desc: 'Tell the community who you are and where you roam.' },
              { step: '02', icon: '🗺️', title: 'Explore the map', desc: 'Browse live events on the map — filter by trail, camp, meetup, or culture.' },
              { step: '03', icon: '⛺', title: 'Join or create', desc: 'Drop a pin anywhere in the world and invite others to join the journey.' },
            ].map((item, i) => (
              <motion.div key={item.step} className="flex-1 flex flex-col gap-4"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <span className="font-display text-forest-200 font-bold text-6xl leading-none select-none">{item.step}</span>
                <div className="text-3xl">{item.icon}</div>
                <h3 className="font-display text-forest-950 text-2xl font-semibold">{item.title}</h3>
                <p className="text-forest-800/60 text-sm leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden grain-overlay" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=85"
            alt="forest trail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-forest-950/30" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 mb-8 tracking-widest">
              <FaLeaf className="text-forest-400" /> FREE TO JOIN
            </span>
          </motion.div>
          <motion.h2
            className="font-display text-white font-bold leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            Ready to<br /><em className="not-italic text-forest-400">roam?</em>
          </motion.h2>
          <motion.p
            className="mt-6 text-white/65 text-lg font-light max-w-md"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          >
            Join over 1,200 nature nomads already on the map.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
          >
            <a href="/signup" className="px-10 py-4 bg-forest-500 hover:bg-forest-400 text-white rounded-full font-semibold text-lg transition-all duration-200 shadow-2xl hover:scale-105 active:scale-100">
              Create Free Account
            </a>
            <a href="/login" className="px-10 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full font-semibold text-lg border border-white/25 transition-all duration-200">
              Log In
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="bg-forest-950 py-10 px-6 text-center border-t border-forest-800/50">
        <div className="flex items-center justify-center gap-2 text-forest-400 mb-3">
          <Logo className="w-6 h-6 text-forest-400" />
          <span className="font-display text-sm tracking-tight font-semibold">NOMAD CONNECT</span>
        </div>
        <p className="text-forest-600 text-xs">
          © {new Date().getFullYear()} NOMAD CONNECT · Built for the wild at heart.
        </p>
      </footer>
    </div>
  )
}
