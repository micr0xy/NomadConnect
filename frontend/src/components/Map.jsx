import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon with warm colors for events
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: #ea580c;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Custom marker icon for user location (teal color)
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        background-color: #14b8a6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.3), 0 3px 6px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.3), 0 3px 6px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(20, 184, 166, 0.1), 0 3px 6px rgba(0,0,0,0.3); }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
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

export default function Map({ 
  center = [27.7172, 85.3240], // Default: Kathmandu, Nepal
  zoom = 13, 
  markers = [],
  height = '100%',
  className = '',
  showUserLocation = false
}) {
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
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        {/* Tile Layer - CartoDB Positron (warm, clean style) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-nomad-teal-600 mb-1">📍 Your Location</h3>
                <p className="text-sm text-gray-600">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render event markers if provided */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position}
            icon={createCustomIcon()}
          >
            {marker.popup && (
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900 mb-1">{marker.title}</h3>
                  {marker.description && (
                    <p className="text-sm text-gray-600">{marker.description}</p>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
