import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import EventList from '../components/EventList';
import CreateEventModal from '../components/CreateEventModal';
import EventDetailPanel from '../components/EventDetailPanel';
import { listEvents } from '../services/eventsApi';
import useAuthStore from '../store/authStore';
import './EventsPage.css';

export default function EventsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // State management
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch events on page load
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const fetchedEvents = await listEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // User-friendly error handling - events will be empty
    } finally {
      setLoadingEvents(false);
    }
  };

  // Convert events to map markers format
  const mapMarkers = events.map((event) => ({
    id: event._id,
    position: [event.location.coordinates[1], event.location.coordinates[0]], // [lat, lng]
    title: event.title,
    description: event.description,
    popup: true,
    event, // Store full event object
  }));

  // Handle map click
  const handleMapClick = (latlng) => {
    setSelectedPosition(latlng);
    setModalOpen(true);
  };

  // Handle event created
  const handleEventCreated = (newEvent) => {
    setEvents([...events, newEvent]);
    setSelectedPosition(null);
    // Optional: show success message
    console.log('Event created:', newEvent);
  };

  // Handle event selected
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDetailsPanelOpen(true);
  };

  // Handle marker click
  const handleMarkerClick = (event) => {
    handleSelectEvent(event);
  };

  if (!isAuthenticated) {
    return null; // Redirect happening in effect
  }

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header">
        <div className="header-content">
          <h1>Explore Events</h1>
          <p>Click on the map to create an event, or browse existing events</p>
        </div>
      </div>

      {/* Main container */}
      <div className="events-container">
        {/* Map section */}
        <div className="map-section">
          <Map
            center={[27.7172, 85.324]} // Kathmandu
            zoom={13}
            markers={mapMarkers}
            height="100%"
            showUserLocation={true}
            onMapClick={handleMapClick}
            selectedPosition={selectedPosition}
          />
        </div>

        {/* Side panel: Event list + details */}
        <div className="side-panel">
          <EventList
            events={events}
            onSelectEvent={handleSelectEvent}
            loading={loadingEvents}
          />
        </div>
      </div>

      {/* Modal for creating events */}
      <CreateEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPosition(null);
        }}
        selectedPosition={selectedPosition}
        onEventCreated={handleEventCreated}
      />

      {/* Side panel for event details */}
      <EventDetailPanel
        isOpen={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        event={selectedEvent}
        onEventUpdated={(updatedEvent) => {
          // Update the event in the list
          setEvents(
            events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
          );
          // Update selected event
          setSelectedEvent(updatedEvent);
        }}
      />
    </div>
  );
}
