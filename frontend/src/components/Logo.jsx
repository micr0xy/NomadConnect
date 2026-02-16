// NOMAD CONNECT Logo Component

const Logo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <circle cx="50" cy="50" r="45" fill="#ea580c" />
    <path d="M 30 40 Q 50 20 70 40" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
    <circle cx="35" cy="45" r="4" fill="white" />
    <circle cx="50" cy="35" r="4" fill="white" />
    <circle cx="65" cy="45" r="4" fill="white" />
    <path d="M 25 55 L 35 75 L 50 60 L 65 75 L 75 55" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default Logo
