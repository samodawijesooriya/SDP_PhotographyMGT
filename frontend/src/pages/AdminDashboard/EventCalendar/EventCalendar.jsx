import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, X, User, Calendar, Clock, MapPin } from 'lucide-react';
import './EventCalendar.css';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const EventCalendar = () => {
  const { url } = useContext(StoreContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch bookings from the API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/api/bookings/calendar`);
        // Transform booking data into calendar events
        const bookingEvents = response.data.map(booking => ({
          id: booking.bookingId,
          title: booking.eventName || `${booking.packageName || 'Booking'}`,
          date: new Date(booking.eventDate),
          time: booking.eventTime || 'Time TBD',
          venue: booking.venue || 'Venue TBD',
          bookingName: booking.fullName,
          status: booking.bookingStatus,
          packageName: booking.packageName,
          coverageHours: booking.coverageHours
        }));
        
        // Filter events for the current month
        const filteredEvents = bookingEvents.filter(event => {
          return event.date.getMonth() === currentDate.getMonth() && 
                 event.date.getFullYear() === currentDate.getFullYear();
        });
        
        setEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, [currentDate.getMonth(), currentDate.getFullYear(), url]);

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setLoading(true);
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setLoading(true);
  };

  // Format month name
  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowPopup(true);
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get today's date information
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => 
        event.date.getDate() === day && 
        event.date.getMonth() === month && 
        event.date.getFullYear() === year
      );
      
      // Check if this day is today
      const isToday = isCurrentMonth && day === todayDate;
      
      days.push(
        <div key={`day-${day}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className={`day-header ${isToday ? 'today-header' : ''}`}>{day}</div>
          <div className="day-content">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`event-item ${event.status === 'pending' ? 'event-pending' : 'event-confirmed'}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-title">{event.title}</div>
                <div className="event-time">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setLoading(true);
  };

  return (
    <div className="event-calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-button" onClick={prevMonth}>
            <ChevronLeft />
          </button>
          <h2>{formatMonth(currentDate)}</h2>
          <button className="nav-button" onClick={nextMonth}>
            <ChevronRight />
          </button>
        </div>
        <button className="today-button" onClick={goToToday}>
          Today
        </button>
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color confirmed"></div>
          <span>Confirmed Bookings</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pending"></div>
          <span>Pending Bookings</span>
        </div>
      </div>
      
      <div className="weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      <div className="calendar-grid">
        {loading ? (
          <div className="loading-container">Loading calendar...</div>
        ) : (
          renderCalendarDays()
        )}
      </div>

      {/* Event Details Popup */}
      {showPopup && selectedEvent && (
        <div className="event-popup-overlay" onClick={closePopup}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>
              <X size={24} />
            </button>
            
            <div className="popup-header">
              <h3>{selectedEvent.title}</h3>
              <span className={`event-status-badge ${selectedEvent.status === 'pending' ? 'status-pending' : 'status-confirmed'}`}>
                {selectedEvent.status}
              </span>
            </div>
            
            <div className="popup-details">
              <div className="detail-item">
                <Calendar size={18} />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              
              <div className="detail-item">
                <Clock size={18} />
                <span>{selectedEvent.time}</span>
              </div>
              
              <div className="detail-item">
                <MapPin size={18} />
                <span>{selectedEvent.venue}</span>
              </div>
              
              <div className="detail-item">
                <User size={18} />
                <span>{selectedEvent.bookingName}</span>
              </div>
              
              {selectedEvent.packageName && (
                <div className="detail-item package-detail">
                  <span className="detail-label">Package:</span>
                  <span>{selectedEvent.packageName}</span>
                </div>
              )}
              
              {selectedEvent.coverageHours && (
                <div className="detail-item coverage-detail">
                  <span className="detail-label">Coverage:</span>
                  <span>{selectedEvent.coverageHours} hours</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;