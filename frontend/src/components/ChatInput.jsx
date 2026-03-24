import React, { useState } from 'react';
import './ChatInput.css';

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

  const handleChange = (e) => {
    setText(e.target.value);
    if (error) setError('');
  };

  const charCount = text.length;
  const isOverLimit = charCount > 1000;

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <textarea
          className="chat-textarea"
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
          disabled={isLoading}
          rows="3"
          maxLength="1000"
        />
        <div className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
          {charCount}/1000
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button
        type="submit"
        className="send-button"
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;
