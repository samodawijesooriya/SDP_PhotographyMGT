import React, { useState, useContext, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import './Notifications.css';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { url } = useContext(StoreContext);  
  
  
  const fetchNewBookings = async () => {  
    try {
      const response = await axios.get(`${url}/api/home/new-bookings`);

      // Get previously read notifications from localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '{}');
      
      // Transform API data to match component expectations
      const formattedNotifications = response.data.map(booking => {
        // Format the createdAt timestamp to be more readable
        const createdDate = new Date(booking.createdAt);
        const formattedTime = createdDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        return {
          bookingId: booking.bookingId,
          isRead: readNotifications[booking.bookingId] === true, 
          type: 'booking', // Default type for bookings
          message: `New booking from ${booking.fullName} for ${booking.eventName || 'an event'} on ${booking.eventDate}`,
          time: formattedTime, // Using formatted createdAt time
          ...booking 
        };
      });
      
      setNotifications(formattedNotifications);
      console.log("New bookings:", formattedNotifications);
    }
    catch (error) {
      console.error("Error fetching new bookings:", error);
      // You should also consider showing an error message to the user
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (bookingId) => {
    // Update state
    setNotifications(
      notifications.map(notification => 
        notification.bookingId === bookingId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    
    // Update localStorage
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '{}');
    readNotifications[bookingId] = false;
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  };

  const markAllAsRead = () => {
    // Update all notifications as read
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    
    // Update localStorage for all notifications
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '{}');
    notifications.forEach(notification => {
      readNotifications[notification.bookingId] = true;
    });
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💰';
      case 'system':
        return '⚙️';
      case 'customer':
        return '👤';
      default:
        return '📣';
    }
  };

  useEffect(() => {
    fetchNewBookings();
    const intervalId = setInterval(fetchNewBookings, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-container">
      <button className="notification-bell" onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button className="close-button" onClick={toggleNotifications}>
              <FaTimes />
            </button>
          </div>
          
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.bookingId} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.bookingId)}
                >
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-notifications">No new notifications</p>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
