import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'
import Sidebar from './Sidebar'
import NotificationIcon from './NotificationIcon'
import './ProtectedLayout.css'

function PlaceSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const runSearch = async () => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 3) {
      setResults([])
      setError('Type at least 3 characters')
      setOpen(true)
      return
    }

    setLoading(true)
    setError('')
    setOpen(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(trimmedQuery)}&addressdetails=1&limit=6`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(Array.isArray(data) ? data : [])
      if (!Array.isArray(data) || data.length === 0) {
        setError('No matching places found')
      }
    } catch (searchError) {
      setResults([])
      setError('Unable to load place results')
    } finally {
      setLoading(false)
    }
  }

  const selectPlace = (result) => {
    window.dispatchEvent(
      new CustomEvent('nomad:place-selected', {
        detail: {
          lat: Number(result.lat),
          lng: Number(result.lon),
          label: result.display_name,
          name: result.name || result.display_name,
        },
      })
    )
    setQuery(result.display_name)
    setOpen(false)
    setResults([])
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      runSearch()
    }
  }

  return (
    <div className="protected-place-search" ref={wrapperRef}>
      <div className="protected-place-search__field">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search places"
          className="protected-place-search__input"
        />
        <button
          type="button"
          className="protected-place-search__button"
          onClick={runSearch}
          aria-label="Search places on the map"
        >
          <FaSearch size={14} />
        </button>
      </div>

      {open && (loading || error || results.length > 0) && (
        <div className="protected-place-search__results">
          {loading && <div className="protected-place-search__status">Searching places...</div>}
          {!loading && error && <div className="protected-place-search__status error">{error}</div>}
          {!loading && results.map((result) => (
            <button
              key={`${result.place_id}-${result.lat}-${result.lon}`}
              type="button"
              className="protected-place-search__result"
              onClick={() => selectPlace(result)}
            >
              <span className="protected-place-search__result-title">{result.name || result.display_name}</span>
              <span className="protected-place-search__result-subtitle">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProtectedLayout({ children }) {
  const location = useLocation()
  const hideNotifications =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/messages') ||
    (location.pathname.startsWith('/events/') && location.pathname.endsWith('/chat'))
  const showPlaceSearch = location.pathname === '/events'

  return (
    <div className="protected-layout">
      <Sidebar />
      <main className="protected-main-content">
        <div className="protected-header-actions">
          {showPlaceSearch && <PlaceSearchBar />}
          {!hideNotifications && <NotificationIcon />}
        </div>
        {children}
      </main>
    </div>
  )
}
