import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, FaUsers, FaBoxOpen, FaCreditCard, FaMoneyBillWave, 
  FaChartBar, FaImage, FaEnvelope, FaCog, FaSearch, FaBars, FaTimes,
  FaBell, FaUser
} from 'react-icons/fa';
import './Home.css';
import { assets } from '../../../assets/assets';
import EventCalendar from '../EventCalendar/EventCalendar';
import Notifications from './Notifications';

const AdminHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  

  // get the username from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const username = userData ? userData.username : 'Phtographer';

  const dashboardItems = [
    {
      id: 1,
      title: 'Bookings',
      icon: <FaCalendarAlt className="dashboard-icon" />,
      count: 12,
      description: 'Active sessions',
      color: '#4361ee'
    },
    {
      id: 2,
      title: 'Customers',
      icon: <FaUsers className="dashboard-icon" />,
      count: 247,
      description: 'Total clients',
      color: '#3a0ca3'
    },
    {
      id: 3,
      title: 'Packages',
      icon: <FaBoxOpen className="dashboard-icon" />,
      count: 8,
      description: 'Available packages',
      color: '#7209b7'
    },
    {
      id: 4,
      title: 'Revenue',
      icon: <FaCreditCard className="dashboard-icon" />,
      count: '$8,320',
      description: 'This month',
      color: '#f72585'
    }
  ];
  
  const mainMenuItems = [
    { id: 1, title: 'Bookings', icon: <FaCalendarAlt />, path: '/admin/bookings' },
    { id: 2, title: 'Customers', icon: <FaUsers />, path: '/admin/customers' },
    { id: 3, title: 'Packages', icon: <FaBoxOpen />, path: '/admin/packages' },
    { id: 4, title: 'Payments', icon: <FaCreditCard />, path: '/admin/payments' },
    { id: 5, title: 'Gallery', icon: <FaImage />, path: '/admin/gallery' },
    { id: 6, title: 'Reports', icon: <FaChartBar />, path: '/admin/reports' },
    { id: 7, title: 'Messages', icon: <FaEnvelope />, path: '/admin/messages' },
    { id: 8, title: 'Settings', icon: <FaCog />, path: '/admin/settings' }
  ];

  const upcomingSessions = [
    { id: 1, client: 'Sarah Johnson', type: 'Wedding Session', date: 'May 12, 2025', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, client: 'Michael Reeves', type: 'Family Portraits', date: 'May 14, 2025', time: '2:30 PM', status: 'Pending' },
    { id: 3, client: 'Emily Parker', type: 'Corporate Event', date: 'May 16, 2025', time: '9:00 AM', status: 'Confirmed' }
  ];

  const recentUploads = [
    { id: 1, title: 'Wedding Collection', client: 'Thomas & Rebecca', count: 124, preview: 'https://via.placeholder.com/100x75' },
    { id: 2, title: 'Corporate Event', client: 'Tech Summit 2025', count: 87, preview: 'https://via.placeholder.com/100x75' },
    { id: 3, title: 'Family Session', client: 'Rodriguez Family', count: 56, preview: 'https://via.placeholder.com/100x75' }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="photo-admin-layout">
        {/* Main Content */}
      <div className="photo-main-content">
        {/* Header */}
        <header className="photo-admin-header">
          <div className="header-left">
            <button className="mobile-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <Notifications/>
            </div>
            <div className="mobile-admin-profile">
              <img src={assets.profile} alt="Admin" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="photo-dashboard-container">
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {userData.username}</h1>
              <p>Here's what's happening with your business today</p>
            </div>
            <div className="date-display">
              <p>Saturday, May 10, 2025</p>
            </div>
          </div>
          
          {/* Dashboard Stats */}
          <div className="stats-grid">
            {dashboardItems.map(item => (
              <div key={item.id} className="stat-card" style={{background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`}}>
                <div className="stat-icon">{item.icon}</div>
                <div className="stat-content">
                  <h3 className="stat-count">{item.count}</h3>
                  <div className="stat-details">
                    <h4 className="stat-title">{item.title}</h4>
                    <p className="stat-description">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="dashboard-grid-container">
            {/* Upcoming Sessions */}
            <div className="photo-card upcoming-sessions">
              <div className="card-header">
                <h2>Upcoming Sessions</h2>
              </div>
              <div className="session-list">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-info">
                      <h4>{session.client}</h4>
                      <p className="session-type">{session.type}</p>
                      <div className="session-time">
                        <FaCalendarAlt /> 
                        <span>{session.date} at {session.time}</span>
                      </div>
                    </div>
                    <div className={`session-status ${session.status.toLowerCase()}`}>
                      {session.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="photo-card recent-activity">
              <div className="card-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon booking">
                    <FaCalendarAlt />
                  </div>
                  <div className="activity-content">
                    <p>New booking from <strong>Sarah Johnson</strong></p>
                    <span className="activity-time">Today, 10:30 AM</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon payment">
                    <FaCreditCard />
                  </div>
                  <div className="activity-content">
                    <p>Payment received for <strong>Wedding Package</strong></p>
                    <span className="activity-time">Yesterday, 3:45 PM</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon client">
                    <FaUser />
                  </div>
                  <div className="activity-content">
                    <p><strong>David Miller</strong> requested a quote</p>
                    <span className="activity-time">Yesterday, 11:20 AM</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon booking">
                    <FaCalendarAlt />
                  </div>
                  <div className="activity-content">
                    <p>Booking rescheduled for <strong>Corporate Event</strong></p>
                    <span className="activity-time">May 8, 2025</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Uploads */}
            <div className="photo-card recent-uploads">
              <div className="card-header">
                <h2>Recent Uploads</h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="uploads-list">
                {recentUploads.map(upload => (
                  <div key={upload.id} className="upload-item">
                    <div className="upload-preview">
                      <img src={upload.preview} alt={upload.title} />
                    </div>
                    <div className="upload-details">
                      <h4>{upload.title}</h4>
                      <p>{upload.client}</p>
                      <span className="photo-count">{upload.count} photos</span>
                    </div>
                    <button className="view-gallery-btn">View</button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="photo-card quick-actions">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>              <div className="actions-grid">
                <button className="action-button" onClick={() => {
                  // Navigate to parent AdminDashboard and set active section to bookings
                  if (window.parent && window.parent.document) {
                    // For iframe scenarios
                    window.parent.postMessage({ action: 'setActiveSection', section: 'bookings' }, '*');
                  } else {
                    // Direct navigation to AdminDashboard with bookings section
                    navigate('/admin-dashboard', { state: { activeSection: 'bookings' } });
                  }
                }}>
                  <FaCalendarAlt />
                  <span>Add New Booking</span>
                </button>                <button className="action-button" onClick={() => {
                  navigate('/admin-dashboard', { state: { activeSection: 'users' } });
                }}>
                  <FaUsers />
                  <span>Add Client</span>
                </button>
                <button className="action-button" onClick={() => {
                  navigate('/admin-dashboard', { state: { activeSection: 'gallery' } });
                }}>
                  <FaImage />
                  <span>Upload Photos</span>
                </button>
                <button className="action-button" onClick={() => {
                  navigate('/admin-dashboard', { state: { activeSection: 'payments' } });
                }}>
                  <FaCreditCard />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;