import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdChat } from 'react-icons/md';

const initialsFromName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const ChatWindow = ({ messages, userEmail, onOpenProfile }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (messages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md px-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-6 text-orange-400 flex justify-center"
          >
            <MdChat size={64} />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No messages yet</h3>
          <p className="text-gray-600">Start the conversation and be the first to say hello!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 px-4 py-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.userEmail === userEmail;
        const senderName = msg.userName || msg.userEmail || 'Traveler';
        return (
          <motion.div
            key={msg._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            {!isOwnMessage && (
              <button
                type="button"
                onClick={() => onOpenProfile?.(msg.userEmail)}
                className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center text-[11px] font-semibold text-gray-600 shrink-0"
                title={`View ${senderName} profile`}
              >
                {msg.userProfileImage ? (
                  <img src={msg.userProfileImage} alt={senderName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initialsFromName(senderName)}</span>
                )}
              </button>
            )}

            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg flex flex-col gap-1 ${
                isOwnMessage
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProfile?.(msg.userEmail)}
                  className={`text-sm font-semibold leading-tight transition-opacity hover:opacity-80 ${
                    isOwnMessage ? 'text-orange-50' : 'text-gray-700'
                  }`}
                >
                  {senderName}
                </button>
                <span className={`text-xs leading-tight flex-shrink-0 ${
                  isOwnMessage ? 'text-orange-100' : 'text-gray-400'
                }`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <p className={`text-sm leading-relaxed break-words ${
                isOwnMessage ? 'text-white' : 'text-gray-700'
              }`}>
                {msg.text}
              </p>
            </div>
          </motion.div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
