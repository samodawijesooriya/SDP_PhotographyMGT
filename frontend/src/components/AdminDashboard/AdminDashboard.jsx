import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { Calendar, BookOpen, Package, Users, CalendarDays } from 'lucide-react';
import UserManagement from './UserManagemnet';

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('bookings');

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    setUserData(storedUserData);
  }, []);

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
            <div className="flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Events</span>
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
              {/* Add booking management content here */}
            </div>
          )}
          {activeSection === 'packages' && (
            <div className="section-container">
              <h2>Manage Packages</h2>
              {/* Add package management content here */}
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
              {/* Add events content here */}
            </div>
          )}
          {activeSection === 'calendar' && (
            <div className="section-container">
              <h2>Event Calendar</h2>
              {/* Add calendar content here */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;