import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MdPeople, MdAccessTime, MdLocationOn } from 'react-icons/md';
import EventCategoryBadge from './EventCategoryBadge';
import './EventCard.css';

const EventCard = ({ event, onSelect, isSelected = false }) => {
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, h:mm a');
    } catch {
      return 'Date TBD';
    }
  };

  const formatLocation = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return 'Location TBD';
    return `${coordinates[1].toFixed(3)}, ${coordinates[0].toFixed(3)}`;
  };

  const attendeeCount = event.participants?.length || event.attendees?.length || 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    hover: {
      y: -4,
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className={`event-card ${isSelected ? 'selected' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div className="event-card-header">
        <div className="event-card-title-section">
          <h3 className="event-card-title">{event.title}</h3>
          <EventCategoryBadge category={event.category || 'other'} size="xs" />
        </div>
        {event.maxAttendees && (
          <div className="event-capacity">
            <MdPeople size={14} />
            <span>{attendeeCount}/{event.maxAttendees}</span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="event-card-description">
          {event.description.substring(0, 80)}
          {event.description.length > 80 ? '...' : ''}
        </p>
      )}

      <div className="event-card-meta">
        <div className="event-card-meta-item">
          <MdAccessTime size={14} />
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div className="event-card-meta-item">
          <MdLocationOn size={14} />
          <span>{formatLocation(event.location?.coordinates)}</span>
        </div>
        {attendeeCount > 0 && (
          <div className="event-card-meta-item">
            <MdPeople size={14} />
            <span>{attendeeCount} attending</span>
          </div>
        )}
      </div>

      {event.status && (
        <div className={`event-status ${event.status}`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </div>
      )}
    </motion.div>
  );
};

export default EventCard;
