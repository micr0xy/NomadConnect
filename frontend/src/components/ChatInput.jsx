import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdSend } from 'react-icons/md';

const ChatInput = ({ onSendMessage, isLoading, userName }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (text.length > 1000) {
      setError('Message cannot exceed 1000 characters');
      return;
    }

    try {
      setError('');
      await onSendMessage(text.trim(), userName);
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (error) setError('');
  };

  const charCount = text.length;
  const isOverLimit = charCount > 1000;

  return (
    <form className="w-full h-full max-h-40 px-4 py-3 bg-white border-t border-gray-200 flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="relative flex gap-3 flex-1 overflow-hidden">
        <textarea
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg font-normal text-sm resize-none outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed overflow-y-auto"
          placeholder="Type a message... (Shift+Enter for new line)"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength="1000"
        />
        <motion.button
          type="submit"
          disabled={isLoading || !text.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="self-end flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mb-2"
        >
          <MdSend size={20} />
        </motion.button>
      </div>
        
        <div className="flex items-center justify-between px-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}
          <span className={`text-xs font-medium ml-auto ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/1000
          </span>
        </div>
    </form>
  );
};

export default ChatInput;
