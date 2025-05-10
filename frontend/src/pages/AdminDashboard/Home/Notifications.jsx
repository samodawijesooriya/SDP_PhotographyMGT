import React, { useState } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      message: 'New booking request from Michael Brown',
      time: '10 minutes ago',
      isRead: false
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment confirmed for Family Portrait Package',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: 3,
      type: 'system',
      message: 'System update scheduled for tonight at 2 AM',
      time: '5 hours ago',
      isRead: true
    },
    {
      id: 4,
      type: 'customer',
      message: 'New customer registration: Jennifer Williams',
      time: 'Yesterday',
      isRead: true
    }
  ]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
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
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
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
                onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
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
