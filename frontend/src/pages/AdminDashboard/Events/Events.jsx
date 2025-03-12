import React, { useState, useEffect, useContext } from 'react';
import { Bell, Calendar, Clock, MapPin, User, Phone, Edit, Save, X } from 'lucide-react';
import './Events.css';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const Events = () => {
  const { url } = useContext(StoreContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const fetchEvents = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format date as YYYY-MM-DD for API request
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await fetch(`${url}/api/bookings/date/${formattedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      // Extract bookings from the response
      const bookingsArray = data.bookings || [];
      
      // Sort events by time
      const sortedEvents = bookingsArray.sort((a, b) => {
        if (!a.eventTime) return 1;
        if (!b.eventTime) return -1;
        return a.eventTime.localeCompare(b.eventTime);
      });
      
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing an event
  const startEditing = (event) => {
    setEditingEvent(event.bookingId);
    setEditNotes(event.notes || '');
    setEditStatus(event.bookingStatus);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEvent(null);
    setEditNotes('');
    setEditStatus('');
  };

  // Save event changes
  const saveEventChanges = async (event) => {
    try {
      const updatedEvent = {
        ...event,
        eventDate: new Date(),
        notes: editNotes,
        bookingStatus: editStatus
      };

      console.log(event.eventDate);
      // using axios to send a PUT request to update the event
      const response = await axios.put(
        `${url}/api/bookings/${event.bookingId}`, 
        updatedEvent,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Update the local state with response data
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.bookingId === event.bookingId ? response.data || updatedEvent : e
        )
      );
      setEditingEvent(null);
      fetchEvents(selectedDate);
    }catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
    }
  };

  // Date navigation functions
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format date
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "Time not specified";
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return "Invalid Time";
    }
  };

  // Get status class for select element
  const getStatusSelectClass = (status) => {
    const statusLower = status.toLowerCase();
    return `status-select ${statusLower}`;
  };

  return (
    <div className="events-container">
      <div className="date-navigation">
        <button className="nav-button" onClick={goToPreviousDay}>
          Previous Day
        </button>
        <button className="today-button" onClick={goToToday}>
          Today
        </button>
        <button className="nav-button" onClick={goToNextDay}>
          Next Day
        </button>
      </div>
      
      <div className="events-header">
        <h3>{formatDate(selectedDate)}</h3>
        <div className="events-count">
          {events.length > 0 ? (
            <span className="event-count">{events.length} event{events.length !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-gray">No events</span>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-events">Loading events...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && (
        <div>
          {events.length === 0 ? (
            <div className="no-events-message">
              <Bell size={48} className="no-events-icon" />
              <p>No events scheduled for this day</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.bookingId} className="event-card">
                  <div className="event-card-header">
                    <h4>{event.eventName || event.packageName || "Untitled Event"}</h4>
                    {editingEvent === event.bookingId ? (
                      <select 
                        className={getStatusSelectClass(editStatus)}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="DONE">Done</option>
                      </select>
                    ) : (
                      <span className={`event-status ${event.bookingStatus?.toLowerCase() || ''}`}>
                        {event.bookingStatus || 'Not Set'}
                      </span>
                    )}
                  </div>
                  
                  <div className="event-card-details">
                    <div className="event-detail">
                      <strong>Client:</strong> <span className="event-detail-value">{event.fullName || "Not provided"}</span>
                    </div>
                    <div className="event-detail">
                      <strong>Time:</strong> <span className="event-detail-value">{formatTime(event.eventTime)}</span>
                    </div>
                    <div className="event-detail">
                      <strong>Venue:</strong> <span className="event-detail-value">{event.venue || "Not specified"}</span>
                    </div>
                    {event.coverageHours && (
                      <div className="event-detail">
                        <strong>Coverage:</strong> <span className="event-detail-value">{event.coverageHours} hours</span>
                      </div>
                    )}
                    <div className="event-detail">
                      <strong>Contact:</strong> <span className="event-detail-value">{event.billingMobile || "Not available"}</span>
                    </div>
                  </div>

                  {editingEvent === event.bookingId ? (
                    <div className="event-notes-edit">
                      <label htmlFor="notes">Notes:</label>
                      <textarea 
                        id="notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows="3"
                        className="notes-textarea"
                        placeholder="Add notes here..."
                      />
                    </div>
                  ) : (
                    event.notes && (
                      <div className="event-notes text-muted">
                        <strong>Notes:</strong> {event.notes}
                      </div>
                    )
                  )}

                  <div className="event-actions">
                    {editingEvent === event.bookingId ? (
                      <>
                        <button 
                          className="action-button save-button"
                          onClick={() => saveEventChanges(event)}
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button 
                          className="action-button cancel-button"
                          onClick={cancelEditing}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        className="action-button edit-button"
                        onClick={() => startEditing(event)}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;