import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { MdArrowBack, MdPeople, MdClose, MdInfo } from 'react-icons/md';
import { listEvents } from '../services/eventsApi';
import useAuthStore from '../store/authStore';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import ParticipantsList from '../components/ParticipantsList';
import { getMessages, sendMessage, joinEvent, leaveEvent, deleteEvent } from '../services/eventsApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function EventChatPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || '';
  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Anonymous';

  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const events = await listEvents();
        const foundEvent = events.find((e) => e._id === eventId);
        if (!foundEvent) {
          setError('Event not found');
          return;
        }
        setEvent(foundEvent);

        // Check if user is participant
        const normalizedUserEmail = (userEmail || '').toLowerCase();
        const isUserParticipant = foundEvent.participants?.some(
          (p) => (p.userEmail || p.email || '').toLowerCase() === normalizedUserEmail
        );
        const creator = (foundEvent.createdByEmail || '').toLowerCase() === normalizedUserEmail;
        setIsCreator(creator);
        setIsParticipant(!!isUserParticipant || creator);
      } catch (err) {
        setError('Failed to load event');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, userEmail]);

  // Initial message load
  useEffect(() => {
    if (!eventId || !isParticipant) return;

    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getMessages(eventId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [eventId, isParticipant]);

  // Realtime chat via Socket.IO
  useEffect(() => {
    if (!eventId || !isParticipant) return;

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join-event', { eventId });
    });

    socket.on('chat:message', (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socket.on('event:participants-updated', (participants) => {
      setEvent((prev) => (prev ? { ...prev, participants } : prev));
    });

    socket.on('event:deleted', ({ eventId: deletedEventId }) => {
      if (deletedEventId === eventId) {
        navigate('/events');
      }
    });

    return () => {
      socket.emit('leave-event', { eventId });
      socket.disconnect();
    };
  }, [eventId, isParticipant, navigate]);

  const handleJoinEvent = async () => {
    try {
      setError('');
      const updatedEvent = await joinEvent(eventId);
      setEvent(updatedEvent);
      setIsParticipant(true);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to join event');
    }
  };

  const handleLeaveEvent = async () => {
    try {
      setError('');
      await leaveEvent(eventId);
      navigate('/events');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to leave event');
    }
  };

  const handleSendMessage = async (text) => {
    try {
      setSendingMessage(true);
      setError('');
      await sendMessage(eventId, text, userName);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to send message');
      throw err;
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm('Delete this event and all its messages? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteEvent(eventId);
      navigate('/events');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to delete event');
    }
  };

  const handleOpenProfile = (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return;

    if (normalizedEmail === String(userEmail || '').toLowerCase()) {
      navigate('/profile');
      return;
    }

    navigate(`/profile/${encodeURIComponent(normalizedEmail)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 gap-4">
        <MdInfo size={48} className="text-gray-400" />
        <p className="text-lg text-gray-600">{error || 'Event not found'}</p>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.button
            onClick={() => navigate('/events')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Back to Events"
          >
            <MdArrowBack size={24} className="text-gray-700" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{event.title}</h1>
            <p className="text-sm text-gray-500 capitalize">{event.eventCategory}</p>
          </div>
        </div>
        
        <motion.button
          onClick={() => setShowParticipants(!showParticipants)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 ml-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-300 rounded-lg text-orange-600 font-semibold hover:shadow-md transition-all duration-200 flex-shrink-0"
          title={`${event.participants?.length || 0} participants`}
        >
          <MdPeople size={20} />
          <span>{event.participants?.length || 0}</span>
        </motion.button>
        {isCreator && (
          <motion.button
            onClick={handleDeleteEvent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 ml-3 bg-red-50 border border-red-300 rounded-lg text-red-600 font-semibold hover:shadow-md transition-all duration-200 flex-shrink-0"
            title="Delete Event"
          >
            Delete Event
          </motion.button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          className="flex items-center justify-between px-6 py-3 bg-red-50 border-b border-red-200"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button
            onClick={() => setError('')}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <MdClose size={18} className="text-red-600" />
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isParticipant ? (
            <motion.div
              className="flex items-center justify-center flex-1 bg-gradient-to-br from-gray-50 to-gray-100 px-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center max-w-md">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-6 text-orange-500"
                >
                  <MdPeople size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Join to Chat</h2>
                <p className="text-gray-600 mb-8">You need to join this event to participate in the group chat</p>
                <motion.button
                  onClick={handleJoinEvent}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Join Event
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto">
                <ChatWindow messages={messages} userEmail={userEmail} onOpenProfile={handleOpenProfile} />
              </div>
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={sendingMessage}
                userName={userName}
              />
            </div>
          )}
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <motion.div
            className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-lg"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Participants</h3>
              <motion.button
                onClick={() => setShowParticipants(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose size={24} className="text-gray-600" />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <ParticipantsList
                participants={event.participants || []}
                createdBy={event.createdByEmail}
                currentUserEmail={userEmail}
                onOpenProfile={handleOpenProfile}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
