/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep forest greens — primary palette
        'forest': {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#3aad52',
          600: '#2d8a40',
          700: '#1e6b2e',
          800: '#1a4522',
          900: '#0f2d14',
          950: '#0a1a0d',
        },
        // Moss / sage mid-tones
        'moss': {
          50:  '#f4faf0',
          100: '#e3f4da',
          200: '#c4e8b5',
          300: '#9dd488',
          400: '#7ab860',
          500: '#5a9944',
          600: '#4a7a34',
          700: '#3a5f28',
          800: '#2d4a1f',
          900: '#1c3014',
        },
        // Earth / warm browns
        'earth': {
          50:  '#fdf5e8',
          100: '#f8e8c8',
          200: '#f0ce94',
          300: '#e5b05a',
          400: '#d4943a',
          500: '#c47a26',
          600: '#a8611e',
          700: '#8b4e18',
          800: '#6e3d14',
          900: '#4a2a0e',
        },
        // Warm cream — light backgrounds
        'cream': {
          50:  '#fefcf7',
          100: '#fdf8ee',
          200: '#f8f0d8',
          300: '#f0e4ba',
          400: '#e5d090',
          500: '#d4b869',
        },
        // Keep teal for map/UI accents
        'nomad-teal': {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Keep orange for backwards compat with auth/dashboard pages
        'nomad-orange': {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #0a1a0d 0%, #1e6b2e 100%)',
        'nature-radial': 'radial-gradient(ellipse at top, #1e6b2e 0%, #0a1a0d 70%)',
        'earth-gradient': 'linear-gradient(to right, #8b4e18, #d4943a)',
      },
    },
  },
  plugins: [],
}

