import React, { useState } from 'react';
import { createEvent, improveEventDraft } from '../services/eventsApi';
import './CreateEventModal.css';

const EVENT_CATEGORIES = [
  { id: 'meetup', label: 'Meetup' },
  { id: 'travel', label: 'Travel' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'food', label: 'Food' },
  { id: 'sports', label: 'Sports' },
  { id: 'other', label: 'Other' },
];

const CreateEventModal = ({ isOpen, onClose, selectedPosition, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    maxParticipants: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [nlpSuggestions, setNlpSuggestions] = useState([]);
  const [serverError, setServerError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setServerError('');
  };

  const handleImproveDraft = async () => {
    setServerError('');

    if (!formData.title.trim() && !formData.description.trim()) {
      setServerError('Add a title or description before improving with AI.');
      return;
    }

    setImproving(true);
    try {
      const improved = await improveEventDraft({
        title: formData.title,
        description: formData.description,
        category: formData.category || 'other',
        date: formData.date,
        time: formData.time,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : null,
        latitude: selectedPosition?.lat,
        longitude: selectedPosition?.lng,
      });

      setFormData((prev) => ({
        ...prev,
        title: improved?.title || prev.title,
        description: improved?.description || prev.description,
      }));
      setNlpSuggestions(improved?.suggestions || []);
    } catch (error) {
      setServerError(error || 'Failed to improve draft. Please try again.');
    } finally {
      setImproving(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    // Combined date + time validation
    if (formData.date && formData.time) {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();

      if (startDateTime <= now) {
        newErrors.datetime = 'Event start time must be in the future';
      }
    }

    if (formData.maxParticipants && parseInt(formData.maxParticipants) < 2) {
      newErrors.maxParticipants = 'Max participants must be at least 2';
    }

    if (!selectedPosition) {
      newErrors.location = 'Location not selected. Please click on the map.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combine date + time into ISO string
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const startTimeISO = startDateTime.toISOString();

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startTime: startTimeISO,
        location: {
          lng: selectedPosition.lng,
          lat: selectedPosition.lat,
          address: selectedPosition.label || '',
        },
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      };

      const createdEvent = await createEvent(eventData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        maxParticipants: '',
      });
      setNlpSuggestions([]);

      // Notify parent
      if (onEventCreated) {
        onEventCreated(createdEvent);
      }

      onClose();
    } catch (error) {
      setServerError(error || 'Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Event</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        {selectedPosition && (
          <div className="location-info">
            <p>📍 Location: {selectedPosition.label || `${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)}`}</p>
            <small>{selectedPosition.label ? `${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)}` : 'Picked from the map'}</small>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Event title"
              disabled={loading}
            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Event description (optional)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="nlp-actions">
            <button
              type="button"
              className="btn-improve"
              onClick={handleImproveDraft}
              disabled={loading || improving}
            >
              {improving ? 'Improving...' : 'Improve with AI'}
            </button>
            <span className="nlp-hint">NLP rewrite for clearer and more engaging copy</span>
          </div>

          {nlpSuggestions.length > 0 && (
            <div className="nlp-suggestions">
              {nlpSuggestions.map((suggestion) => (
                <p key={suggestion} className="nlp-suggestion-item">• {suggestion}</p>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select category</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="error">{errors.category}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.date && <p className="error">{errors.date}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="time">
                Time <span className="required">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.time && <p className="error">{errors.time}</p>}
            </div>
          </div>

          {errors.datetime && <p className="error">{errors.datetime}</p>}

          <div className="form-group">
            <label htmlFor="maxParticipants">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="2 or more (optional)"
              min="2"
              disabled={loading}
            />
            {errors.maxParticipants && <p className="error">{errors.maxParticipants}</p>}
          </div>

          {errors.location && <p className="error">{errors.location}</p>}
          {serverError && <p className="error server-error">{serverError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
