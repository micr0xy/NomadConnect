import Map from '../components/Map';
import EventList from '../components/EventList';
import useAuthStore from '../store/authStore';
import CreateEventModal from '../components/CreateEventModal';
import EventDetailPanel from '../components/EventDetailPanel';
import { listEvents } from '../services/eventsApi';
import './EventsPage.css';
import {useEffect, useState} from 'react';

export default function EventsPage() {
  const user = useAuthStore((state) => state.user);
  const userAvatar = user?.profileImage || '';
  const userInitials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : '?';

  // State management
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.324]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Fetch events on page load
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const handlePlaceSelected = (event) => {
      const place = event.detail;
      if (!place) {
        return;
      }

      setSelectedPosition(place);
      setMapCenter([place.lat, place.lng]);
      setModalOpen(true);
    };

    window.addEventListener('nomad:place-selected', handlePlaceSelected);
    return () => window.removeEventListener('nomad:place-selected', handlePlaceSelected);
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
  const openCreateModalAtLocation = (location) => {
    setSelectedPosition(location);
    setMapCenter([location.lat, location.lng]);
    setModalOpen(true);
  };

  // Handle map click
  const handleMapClick = (latlng) => {
    openCreateModalAtLocation(latlng);
  };

  // Handle event created
  const handleEventCreated = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
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

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header">
        <div className="header-content">
          <span className="header-kicker">Discover</span>
          <h1>Explore Events</h1>
          <p>Find nearby meetups or drop a pin to create your own event in seconds.</p>
        </div>
      </div>

      {/* Main container */}
      <div className="events-container">
        <div className="map-section">
          <Map
            center={mapCenter}
            zoom={13}
            markers={mapMarkers}
            height="100%"
            showUserLocation={true}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            selectedPosition={selectedPosition}
            userAvatar={userAvatar}
            userInitials={userInitials}
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
          setEvents((prevEvents) =>
            prevEvents.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
          );
          // Update selected event
          setSelectedEvent(updatedEvent);
        }}
        onEventDeleted={(deletedEventId) => {
          setEvents((prevEvents) => prevEvents.filter((e) => e._id !== deletedEventId));
          setSelectedEvent(null);
          setDetailsPanelOpen(false);
        }}
      />
    </div>
  );
}
