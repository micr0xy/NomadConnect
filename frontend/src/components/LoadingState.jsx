import React from 'react';
import { motion } from 'framer-motion';
import './LoadingState.css';

const EventCardSkeleton = () => {
  return (
    <div className="event-card skeleton">
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
      </div>
    </div>
  );
};

const LoadingState = ({ count = 3, variant = 'card' }) => {
  return (
    <div className="loading-state">
      {variant === 'card' && (
        <motion.div
          className="loading-container"
          animation="fadeIn"
        >
          {Array.from({ length: count }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <EventCardSkeleton />
            </motion.div>
          ))}
        </motion.div>
      )}

      {variant === 'list' && (
        <div className="loading-list">
          {Array.from({ length: count }).map((_, idx) => (
            <motion.div
              key={idx}
              className="skeleton-bar"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            ></motion.div>
          ))}
        </div>
      )}

      {variant === 'inline' && (
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="spinner-circle"></div>
        </motion.div>
      )}
    </div>
  );
};

export default LoadingState;
