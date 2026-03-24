import React, { useEffect, useState } from 'react';
import { joinEvent, leaveEvent, sendMessage, getMessages } from '../services/eventsApi';
import useAuthStore from '../store/authStore';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import './EventDetailPanel.css';

const EventDetailPanel = ({ isOpen, onClose, event, onEventUpdated }) => {
  const userEmail = useAuthStore((state) => state.userEmail);
  const userName = useAuthStore((state) => state.userName);
  
  const [isUserParticipant, setIsUserParticipant] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState('');
  const [pollInterval, setPollInterval] = useState(null);

  if (!isOpen || !event) return null;

  // Check if current user is a participant
  useEffect(() => {
    if (event?.participants && userEmail) {
      const isParticipant = event.participants.some((p) => p.userEmail === userEmail);
      setIsUserParticipant(isParticipant);
    }
  }, [event, userEmail]);

  // Fetch messages periodically (polling)
  useEffect(() => {
    if (!isOpen || !event?._id) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingChat(true);
        setChatError('');
        const fetchedMessages = await getMessages(event._id);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setChatError(typeof error === 'string' ? error : 'Failed to load messages');
      } finally {
        setIsLoadingChat(false);
      }
    };

    // Fetch immediately
    fetchMessages();

    // Set up polling every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    setPollInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, event?._id]);

  const handleJoinEvent = async () => {
    try {
      setChatError('');
      const updatedEvent = await joinEvent(event._id);
      setIsUserParticipant(true);
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch (error) {
      setChatError(typeof error === 'string' ? error : 'Failed to join event');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setChatError('');
      const updatedEvent = await leaveEvent(event._id);
      setIsUserParticipant(false);
      setMessages([]);
      if (onEventUpdated) onEventUpdated(updatedEvent);
    } catch (error) {
      setChatError(typeof error === 'string' ? error : 'Failed to leave event');
    }
  };

  const handleSendMessage = async (text) => {
    try {
      setIsSendingMessage(true);
      setChatError('');
      await sendMessage(event._id, text, userName);
      // Message will appear on next poll
    } catch (error) {
      setChatError(typeof error === 'string' ? error : 'Failed to send message');
      throw error;
    } finally {
      setIsSendingMessage(false);
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

  return (
    <div className="detail-panel-overlay">
      <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
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

          {/* Join/Leave Button */}
          <div className="detail-actions">
            {!isUserParticipant ? (
              <button className="btn-join" onClick={handleJoinEvent}>
                Join Event
              </button>
            ) : (
              <button className="btn-leave" onClick={handleLeaveEvent}>
                Leave Event
              </button>
            )}
          </div>

          {/* Chat Section - Only visible to participants */}
          {isUserParticipant && (
            <div className="chat-section">
              <h3>💬 Group Chat</h3>
              <ChatWindow messages={messages} userEmail={userEmail} />
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
                userName={userName}
              />
            </div>
          )}

          {chatError && (
            <div className="error-banner">
              {chatError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPanel;
