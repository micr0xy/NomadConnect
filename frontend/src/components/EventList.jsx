import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import './EventList.css';

const EventList = ({ events, onSelectEvent, loading }) => {
  const [filteredEvents, setFilteredEvents] = useState(events || []);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Update filtered events when events change
  React.useEffect(() => {
    setFilteredEvents(events || []);
  }, [events]);

  const handleSelectEvent = (event) => {
    setSelectedEventId(event._id);
    onSelectEvent(event);
  };

  const handleFilterChange = useCallback((filters) => {
    setFilteredEvents(filters);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="event-list-container">
        <div className="event-list-header">
          <h3>📅 Upcoming Events</h3>
        </div>
        <div className="event-list-content">
          <LoadingState count={3} variant="card" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="event-list-container">
        <div className="event-list-header">
          <h3>📅 Upcoming Events</h3>
        </div>
        <div className="event-list-content">
          <EmptyState
            type="no-events"
            message="No events in your area yet"
            hint="Click on the map to create your first event!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h3>📅 Upcoming Events ({filteredEvents.length})</h3>
      </div>

      {/* Filters */}
      <EventFilters events={events} onFilterChange={handleFilterChange} />

      {/* Events list or empty state */}
      <div className="event-list-content">
        {filteredEvents.length === 0 ? (
          <EmptyState
            type="no-search-results"
            message="No events match your filters"
            hint="Try adjusting your search or filters"
          />
        ) : (
          <motion.div className="event-list">
            {filteredEvents.map((event, idx) => (
              <EventCard
                key={event._id}
                event={event}
                onSelect={() => handleSelectEvent(event)}
                isSelected={selectedEventId === event._id}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventList;
