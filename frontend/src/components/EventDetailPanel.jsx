import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChat } from 'react-icons/md';
import { motion } from 'framer-motion';
import { joinEvent, leaveEvent, deleteEvent } from '../services/eventsApi';
import useAuthStore from '../store/authStore';
import './EventDetailPanel.css';

const EventDetailPanel = ({ isOpen, onClose, event, onEventUpdated, onEventDeleted }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || '';
  const isAdmin = user?.role === 'admin';
  
  const [isUserParticipant, setIsUserParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');

  // Check if current user is a participant
  useEffect(() => {
    if (event && userEmail) {
      const normalizedUserEmail = userEmail.toLowerCase();
      const participants = Array.isArray(event.participants) ? event.participants : [];
      const isParticipant = participants.some(
        (p) => ((p.userEmail || p.email || '').toLowerCase() === normalizedUserEmail)
      );
      const creator = (event.createdByEmail || '').toLowerCase() === normalizedUserEmail;
      setIsCreator(creator);
      setIsUserParticipant(isParticipant || creator);
    } else {
      setIsUserParticipant(false);
      setIsCreator(false);
    }
  }, [event, userEmail]);

  const handleJoinEvent = async () => {
    try {
      setError('');
      const updatedEvent = await joinEvent(event._id);
      setIsUserParticipant(true);
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Failed to join event');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setError('');
      const updatedEvent = await leaveEvent(event._id);
      setIsUserParticipant(false);
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Failed to leave event');
    }
  };

  const handleViewChat = () => {
    navigate(`/events/${event._id}/chat`);
    onClose();
  };

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm('Delete this event and all its chat messages? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteEvent(event._id);
      if (onEventDeleted) {
        onEventDeleted(event._id);
      }
      onClose();
    } catch (deleteError) {
      setError(typeof deleteError === 'string' ? deleteError : 'Failed to delete event');
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return 'N/A';
    return `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`;
  };

  const participantCount = event?.participants?.length || 0;

  if (!isOpen || !event) return null;

  return (
    <div className="detail-panel-overlay">
      <motion.div
        className={`detail-panel ${isOpen ? 'open' : ''}`}
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="detail-header">
          <h2>{event.title}</h2>
          <button className="detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-content">
          {event.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>
          )}

          <div className="detail-section">
            <h3>📅 Date & Time</h3>
            <p>{formatDateTime(event.startTime)}</p>
          </div>

          <div className="detail-section">
            <h3>📍 Location</h3>
            <p>{formatCoordinates(event.location?.coordinates)}</p>
          </div>

          <div className="detail-section">
            <h3>👥 Participants</h3>
            <p>
              {participantCount}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ' (unlimited)'}
            </p>
          </div>

          {event.createdByEmail && (
            <div className="detail-section">
              <h3>✉️ Created By</h3>
              <p>{event.createdByEmail}</p>
            </div>
          )}

          {event.createdAt && (
            <div className="detail-section">
              <h3>Created On</h3>
              <p>{new Date(event.createdAt).toLocaleDateString()}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="detail-actions">
            <div className="action-buttons">
              {!isUserParticipant ? (
                <motion.button
                  className="btn-join"
                  onClick={handleJoinEvent}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Event
                </motion.button>
              ) : (
                <>
                  <motion.button
                    className="btn-chat"
                    onClick={handleViewChat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdChat size={18} />
                    View Chat
                  </motion.button>
                  <motion.button
                    className="btn-leave"
                    onClick={handleLeaveEvent}
                    disabled={isCreator}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCreator ? 'Host cannot leave' : 'Leave Event'}
                  </motion.button>
                </>
              )}

              {(isCreator || isAdmin) && (
                <motion.button
                  className="btn-leave"
                  onClick={handleDeleteEvent}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete Event
                </motion.button>
              )}
            </div>
          </div>

          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailPanel;
