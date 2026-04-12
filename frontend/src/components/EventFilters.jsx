import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdClose, MdFilterAlt } from 'react-icons/md';
import './EventFilters.css';

const EventFilters = ({ events, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { id: 'meetup', label: 'Meetup' },
    { id: 'travel', label: 'Travel' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'food', label: 'Food' },
    { id: 'sports', label: 'Sports' },
    { id: 'other', label: 'Other' },
  ];

  // Filter logic
  const applyFilters = useCallback(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((event) =>
        selectedCategories.includes(event.category || 'other')
      );
    }

    onFilterChange(filtered);
  }, [searchTerm, selectedCategories, events, onFilterChange]);

  // Call filter when search or categories change
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategories, applyFilters]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setIsExpanded(false);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0;

  return (
    <div className="event-filters-container">
      {/* Search bar */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <MdSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <motion.button
              className="clear-button"
              onClick={() => setSearchTerm('')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdClose size={18} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filter toggle button */}
      <motion.button
        className={`filter-toggle ${isExpanded ? 'expanded' : ''} ${hasActiveFilters ? 'active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <MdFilterAlt size={16} />
        <span>Filters</span>
        {hasActiveFilters && <span className="filter-badge">{searchTerm || selectedCategories.length}</span>}
      </motion.button>

      {/* Filter panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-section">
              <h4 className="filter-title">Categories</h4>
              <div className="category-options">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    className={`category-button ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => handleCategoryToggle(cat.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="category-checkbox">
                      {selectedCategories.includes(cat.id) && '✓'}
                    </span>
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <motion.button
                className="clear-filters-button"
                onClick={handleClearFilters}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFilters;
