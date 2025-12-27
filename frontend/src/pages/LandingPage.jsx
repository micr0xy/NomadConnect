import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">NomadConnect</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with digital nomads around the world, share experiences, and build meaningful
          relationships while traveling.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why NomadConnect?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Global Community',
              description: 'Connect with nomads from over 150 countries and share your travel stories.',
              icon: '🌍',
            },
            {
              title: 'Find Co-working Spots',
              description: 'Discover the best cafes, coworking spaces, and work-friendly locations.',
              icon: '💼',
            },
            {
              title: 'Travel Tips & Guides',
              description: 'Access insider knowledge about visa policies, costs of living, and local insights.',
              icon: '✈️',
            },
            {
              title: 'Accommodation Sharing',
              description: 'Find short-term rentals and connect with other travelers for roommates.',
              icon: '🏠',
            },
            {
              title: 'Events & Meetups',
              description: 'Attend local meetups, networking events, and skill-sharing sessions.',
              icon: '🎉',
            },
            {
              title: 'Wellness Support',
              description: 'Access mental health resources and fitness communities for remote workers.',
              icon: '💪',
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-xl mb-8">Start your journey with NomadConnect today and connect with thousands of digital nomads.</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 NomadConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
