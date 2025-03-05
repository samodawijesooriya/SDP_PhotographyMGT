import React, { useState, useEffect, useContext } from 'react';
import { Bell, Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import './Events.css';
import { StoreContext } from '../../../context/StoreContext';

const Events = () => {
  const { url } = useContext(StoreContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
            <div>
              {events.map(event => (
                <div key={event.bookingId} className="event-card">
                  <div className="event-card-header">
                    <h4>{event.eventName || event.packageName || "Untitled Event"}</h4>
                    <span className={`event-status ${event.bookingStatus.toLowerCase()}`}>
                      {event.bookingStatus}
                    </span>
                  </div>
                  
                  <div className="event-card-details">
                    <div className="event-detail">
                      <strong>Client:</strong> {event.fullName || "Not provided"}
                    </div>
                    <div className="event-detail">
                      <strong>Time:</strong> {formatTime(event.eventTime)}
                    </div>
                    <div className="event-detail">
                      <strong>Venue:</strong> {event.venue || "Not specified"}
                    </div>
                    {event.coverageHours && (
                      <div className="event-detail">
                        <strong>Coverage:</strong> {event.coverageHours} hours
                      </div>
                    )}
                    <div className="event-detail">
                      <strong>Contact:</strong> {event.billingMobile || "Not available"}
                    </div>
                  </div>

                  {event.notes && (
                    <div className="event-notes text-muted">
                      <strong>Notes:</strong> {event.notes}
                    </div>
                  )}
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