import React, { use, useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, FaUsers, FaBoxOpen, FaCreditCard, FaMoneyBillWave, 
  FaChartBar, FaImage, FaEnvelope, FaCog, FaSearch, FaBars, FaTimes,
  FaBell, FaUser
} from 'react-icons/fa';
import './Home.css';
import { assets } from '../../../assets/assets';
import Notifications from './Notifications';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';

const AdminHome = () => {
  const { url } = useContext(StoreContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStats, setBookingStats] = useState([]);
  const [sumaryStats, setSummaryStats] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const navigate = useNavigate();
  
  const fetchBookingStats = async () => {
    try {
      const response = await axios.get(`${url}/api/home/booking-stats`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch booking statistics');
      }
      setBookingStats(response.data);
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
    }
  }

  const fetchUpcomingBookings = async () => {
    try {
      const response = await axios.get(`${url}/api/home/upcoming-bookings`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch upcoming bookings');
      }
      setUpcomingBookings(response.data);
      console.log("Upcoming bookings:", response.data);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    }
  }

  const fetchSummaryStats= async () => {
    try {
      const response = await axios.get(`${url}/api/home/sumary-stats`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch customer count');
      }
      console.log("Customer count:", response.data);
      setSummaryStats(response.data);
    } catch (error) {
      console.error('Error fetching customer count:', error);
    }
  }

  // get the username from local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const username = userData ? userData.username : 'Phtographer';

  const dashboardItems = [
    {
      id: 1,
      title: 'Bookings',
      icon: <FaCalendarAlt className="dashboard-icon" />,
      count: bookingStats.totalCount || 0,
      description: 'Active sessions',
      color: '#4361ee'
    },
    {
      id: 2,
      title: 'Customers',
      icon: <FaUsers className="dashboard-icon" />,
      count: sumaryStats.customerCount || 0,
      description: 'Total clients',
      color: '#3a0ca3'
    },
    {
      id: 3,
      title: 'Packages',
      icon: <FaBoxOpen className="dashboard-icon" />,
      count: sumaryStats.packageCount || 0,
      description: 'Available packages',
      color: '#7209b7'
    },
    {
      id: 4,
      title: 'Revenue',
      icon: <FaCreditCard className="dashboard-icon" />,
      count: sumaryStats.totalRevenue || 0,
      description: 'This month',
      color: '#f72585'
    }
  ];
  
  const recentUploads = [
    { id: 1, title: 'Wedding Collection', client: 'Thomas & Rebecca', count: 124, preview: 'https://via.placeholder.com/100x75' },
    { id: 2, title: 'Corporate Event', client: 'Tech Summit 2025', count: 87, preview: 'https://via.placeholder.com/100x75' },
    { id: 3, title: 'Family Session', client: 'Rodriguez Family', count: 56, preview: 'https://via.placeholder.com/100x75' }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchBookingStats();
    fetchUpcomingBookings();
    fetchSummaryStats();
  }, []);

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

        <div className="photo-dashboard-container">
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {userData.username}</h1>
              <p>Here's what's happening with your business today</p>
            </div>
            <div className="date-display">
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
                {upcomingBookings.map(booking => (
                  <div key={booking.bookingId} className="session-item">
                    <div className="session-info">
                      <h4>{booking.fullName}</h4>
                      <p className="session-type">{booking.eventName} - {booking.packageName}</p>
                      <div className="session-time">
                        <FaCalendarAlt /> 
                        <span>{new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {booking.eventTime.substring(0, 5)}</span>
                      </div>
                    </div>
                    <div className={`session-status ${booking.bookingStatus.toLowerCase()}`}>
                      {booking.bookingStatus}
                    </div>
                  </div>
                ))}
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
              </div>
              <div className="actions-grid">
                <button className="action-button">
                  <FaCalendarAlt />
                  <span>Add New Booking</span>
                </button>
                <button className="action-button">
                  <FaUsers />
                  <span>Add Client</span>
                </button>
                <button className="action-button">
                  <FaImage />
                  <span>Upload Photos</span>
                </button>
                <button className="action-button">
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