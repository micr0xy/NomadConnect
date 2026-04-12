import React from 'react';
import { motion } from 'framer-motion';
import { MdEventNote, MdSearchOff, MdFilterAlt } from 'react-icons/md';
import './EmptyState.css';

const EmptyState = ({ type = 'no-events', message, hint }) => {
  const configs = {
    'no-events': {
      icon: MdEventNote,
      title: 'No events yet',
      subtitle: message || 'No events found in the area',
      hint: hint || 'Click on the map to create your first event!',
    },
    'no-search-results': {
      icon: MdSearchOff,
      title: 'No results found',
      subtitle: message || 'Try adjusting your search filters',
      hint: hint || 'Clear filters or try a different search',
    },
    'no-filter-results': {
      icon: MdFilterAlt,
      title: 'No matches',
      subtitle: message || 'No events match your filters',
      hint: hint || 'Try a different filter combination',
    },
  };

  const config = configs[type] || configs['no-events'];
  const Icon = config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="empty-state-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="empty-state-icon" variants={iconVariants}>
        <Icon size={64} />
      </motion.div>
      <h3 className="empty-state-title">{config.title}</h3>
      <p className="empty-state-subtitle">{config.subtitle}</p>
      <p className="empty-state-hint">{config.hint}</p>
    </motion.div>
  );
};

export default EmptyState;
