import React from 'react';
import './EventList.css';

const EventList = ({ events, onSelectEvent, loading }) => {
  const formatEventTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return 'Unknown location';
    return `${coordinates[1].toFixed(2)}, ${coordinates[0].toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="event-list-container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="event-list-container">
        <div className="empty-state">
          <p>📍 No events yet</p>
          <p className="empty-hint">Click on the map to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h3>📅 Upcoming Events ({events.length})</h3>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <div
            key={event._id}
            className="event-item"
            onClick={() => onSelectEvent(event)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectEvent(event);
              }
            }}
          >
            <div className="event-item-title">{event.title}</div>
            <div className="event-item-time">🕐 {formatEventTime(event.startTime)}</div>
            <div className="event-item-location">
              📍 {formatLocation(event.location?.coordinates)}
            </div>
            {event.description && (
              <div className="event-item-description">{event.description.substring(0, 60)}...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
