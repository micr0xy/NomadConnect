import React from 'react';
import { motion } from 'framer-motion';
import './EventCategoryBadge.css';

const categoryConfig = {
  meetup: { label: 'Meetup', color: '#3B82F6', bgColor: '#DBEAFE' },
  travel: { label: 'Travel', color: '#10B981', bgColor: '#D1FAE5' },
  adventure: { label: 'Adventure', color: '#F59E0B', bgColor: '#FEF3C7' },
  cultural: { label: 'Cultural', color: '#8B5CF6', bgColor: '#EDE9FE' },
  food: { label: 'Food', color: '#EC4899', bgColor: '#FCE7F3' },
  sports: { label: 'Sports', color: '#EF4444', bgColor: '#FEE2E2' },
  other: { label: 'Other', color: '#6B7280', bgColor: '#F3F4F6' },
};

const EventCategoryBadge = ({ category, size = 'sm' }) => {
  const config = categoryConfig[category] || categoryConfig.other;

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  };

  return (
    <motion.span
      className={`event-category-badge ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {config.label}
    </motion.span>
  );
};

export default EventCategoryBadge;
