import React from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdAccessTime } from 'react-icons/md';
import { format } from 'date-fns';
import EventCategoryBadge from './EventCategoryBadge';
import './EventTooltip.css';

const EventTooltip = ({ event, onViewDetails }) => {
  if (!event) return null;

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, h:mm a');
    } catch {
      return 'Date TBD';
    }
  };

  const attendeeCount = event.participants?.length || event.attendees?.length || 0;

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      transition: { duration: 0.15 },
    },
  };

  return (
    <motion.div
      className="event-tooltip"
      variants={tooltipVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="tooltip-header">
        <h4 className="tooltip-title">{event.title}</h4>
        <EventCategoryBadge category={event.category || 'other'} size="xs" />
      </div>

      {event.description && (
        <p className="tooltip-description">{event.description.substring(0, 60)}...</p>
      )}

      <div className="tooltip-meta">
        <div className="tooltip-meta-item">
          <MdAccessTime size={14} />
          <span>{formatDate(event.startTime)}</span>
        </div>
        {attendeeCount > 0 && (
          <div className="tooltip-meta-item">
            <MdPeople size={14} />
            <span>{attendeeCount} going</span>
          </div>
        )}
      </div>

      <motion.button
        className="tooltip-button"
        onClick={onViewDetails}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Details
      </motion.button>
    </motion.div>
  );
};

export default EventTooltip;
