import React, { useState, useEffect, useContext } from 'react';
import './AdminDashboard.css';
import { Calendar, BookOpen, Package, Users, CalendarDays } from 'lucide-react';
import UserManagement from './UserManagemnet';
import ManagePackages from './ManagePackages';
import ManageBookings from './ManageBookings/ManageBookings';
import EventCalendar from './EventCalendar/EventCalendar';
import Events from './Events/Events';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const AdminDashboard = () => {
  const { url } = useContext(StoreContext);
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('bookings');
  const [todayEventsCount, setTodayEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    setUserData(storedUserData);

    // Check for today's events to display the notification badge
    checkTodayEvents();
  }, []);

  const checkTodayEvents = async () => {
    try {
      setLoading(true);
      
      // Format today's date as YYYY-MM-DD for API request
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      const response = await axios.get(`${url}/api/bookings/date/${formattedDate}`);
      
      // Set the count of today's events for the notification badge
      setTodayEventsCount(response.data.length || 0);
    } catch (error) {
      console.error('Error checking today\'s events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {userData?.username}</h1>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/';
        }}>Logout</button>
      </header>

      <div className="dashboard-container">
        <nav className="sidebar">
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'bookings' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('bookings')}
          >
            <div className="flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Manage Bookings</span>
          </button>
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'packages' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('packages')}
          >
            <div className="flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <span>Manage Packages</span>
          </button>
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'users' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('users')}
          >
            <div className="flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span>Manage Users</span>
          </button>
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'events' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('events')}
          >
            <div className="flex-shrink-0 relative">
              <Calendar className="w-5 h-5" />
              {todayEventsCount > 0 && (
                <span className="notification-badge">
                  {todayEventsCount}
                </span>
              )}
            </div>
            <span>Today's Event</span>
          </button>
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'calendar' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('calendar')}
          >
            <div className="flex-shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>Event Calendar</span>
          </button>
        </nav>

        <main className="content-area">
          {activeSection === 'bookings' && (
            <div className="section-container">
              <h2>Manage Bookings</h2>
              <ManageBookings />
            </div>
          )}
          {activeSection === 'packages' && (
            <div className="section-container">
              <h2>Manage Packages</h2>  
              <ManagePackages />
            </div>
          )}
          {activeSection === 'users' && (
            <div className="section-container">
              <h2>Manage Users</h2>
              <UserManagement />
            </div>
          )}
          {activeSection === 'events' && (
            <div className="section-container">
              <h2>Events</h2>
              <Events />
            </div>
          )}
          {activeSection === 'calendar' && (
            <div className="section-container">
              <h2>Event Calendar</h2>
              <EventCalendar />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;