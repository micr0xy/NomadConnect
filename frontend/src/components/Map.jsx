import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})
import EventTooltip from './EventTooltip'
import './Map.css'

// Category-based color + emoji mapping
const categoryConfig = {
  meetup:    { color: '#3B82F6', emoji: '🤝' },
  travel:    { color: '#10B981', emoji: '✈️' },
  adventure: { color: '#F59E0B', emoji: '⛺' },
  cultural:  { color: '#8B5CF6', emoji: '🎭' },
  food:      { color: '#EC4899', emoji: '🍜' },
  sports:    { color: '#EF4444', emoji: '⚽' },
  other:     { color: '#6B7280', emoji: '📌' },
}

// Create category-specific marker icon with emoji avatar
const createCategoryIcon = (category = 'other') => {
  const cfg = categoryConfig[category] || categoryConfig.other
  return L.divIcon({
    className: 'category-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 52px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        <!-- Pin bubble -->
        <div style="
          background: linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 18px;
            line-height: 1;
            display: block;
          ">${cfg.emoji}</span>
        </div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    popupAnchor: [0, -52],
  })
}

// Custom marker icon for user location — shows profile avatar or initials
const createUserLocationIcon = (avatarUrl = '', initials = '?') => {
  const inner = avatarUrl
    ? `<img src="${avatarUrl}" alt="you" style="
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      " onerror="this.style.display='none';this.parentNode.innerHTML='<span style=\'font-size:14px;font-weight:700;color:#0f766e;\'>${initials}</span>'" />`
    : `<span style="font-size:14px;font-weight:700;color:#0f766e;">${initials}</span>`

  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid #14b8a6;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.35), 0 3px 8px rgba(0,0,0,0.3);
        background-color: #ccfbf1;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: userPulse 2s infinite;
      ">${inner}</div>
      <style>
        @keyframes userPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.35), 0 3px 8px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 9px rgba(20, 184, 166, 0.1), 0 3px 8px rgba(0,0,0,0.3); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

// Component to handle map center changes
function MapUpdater({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
  return null
}

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
      }
    },
  })
  return null
}

export default function Map({ 
  center = [27.7172, 85.3240], // Default: Kathmandu, Nepal
  zoom = 13, 
  markers = [],
  height = '100%',
  className = '',
  showUserLocation = false,
  onMapClick = null,
  selectedPosition = null,
  onMarkerClick = null,
  userAvatar = '',
  userInitials = '?',
}) {
  const [popupOpen, setPopupOpen] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)

  // Get user's geolocation
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userPos)
          // Center map on user location when available
          setMapCenter(userPos)
          setMapZoom(13)
        },
        (error) => {
          console.error('Error getting user location:', error)
          // Fall back to default center if geolocation fails
        }
      )
    }
  }, [showUserLocation])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Tile Layer - CartoDB Positron (warm, clean style) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* Map click handler */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon(userAvatar, userInitials)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-nomad-teal-600 mb-1">📍 Your Location</h3>
                <p className="text-sm text-gray-600">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Selected location marker for event creation */}
        {selectedPosition && (
          <Marker
            position={[selectedPosition.lat, selectedPosition.lng]}
            icon={L.divIcon({
              className: 'selected-location-marker',
              html: `
                <div style="
                  background-color: #3b82f6;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 3px solid white;
                  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  animation: bounce 1s infinite;
                ">
                  <div style="
                    width: 8px;
                    height: 8px;
                    background-color: white;
                    border-radius: 50%;
                    transform: rotate(45deg);
                  "></div>
                </div>
                <style>
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0) rotate(-45deg); }
                    50% { transform: translateY(-8px) rotate(-45deg); }
                  }
                </style>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-blue-600 mb-1">📍 Selected Location</h3>
                <p className="text-sm text-gray-600">Click to create event</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render event markers if provided */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position}
            icon={createCategoryIcon(marker.event?.category)}
            eventHandlers={{
              click: () => {
                setPopupOpen(marker.id)
                if (onMarkerClick) {
                  onMarkerClick(marker.event)
                }
              },
            }}
          >
            {popupOpen === marker.id && marker.popup && (
              <Popup onClose={() => setPopupOpen(null)}>
                <EventTooltip
                  event={marker.event}
                  onViewDetails={() => {
                    if (onMarkerClick) {
                      onMarkerClick(marker.event)
                    }
                    setPopupOpen(null)
                  }}
                />
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
