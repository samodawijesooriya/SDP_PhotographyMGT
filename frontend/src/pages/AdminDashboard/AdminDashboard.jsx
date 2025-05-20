import React, { useState, useEffect, useContext } from 'react';
import './AdminDashboard.css';
import { Calendar, BookOpen, Package, Users, CalendarDays, Home, CreditCard, Image, Grid, ToggleLeft} from 'lucide-react';
import ManagePackages from './ManagePackages';
import ManagePackageItems from './PackageItems/ManagePackageItems';
import ManagePackageDetails from './PackageDetails/ManagePackageDetails';
import ManageBookings from './ManageBookings/ManageBookings';
import EventCalendar from './EventCalendar/EventCalendar';
import Events from './Events/Events';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import CustomerManagement from './Customers/CustomerManagement';
import Payments from './Payments/Payments';
import Reports from './Reports/Reports';
import HomeUi from './Home/Home';
import StatusChanger from './StatusChanger/StatusChanger';
import { useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const { url } = useContext(StoreContext);
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [todayEventsCount, setTodayEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [packageSubMenu, setPackageSubMenu] = useState('packages'); // For package section submenu
  const location = useLocation();


  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    setUserData(storedUserData);

    // Check for today's events to display the notification badge
    checkTodayEvents();
    
    // Check if we need to activate a specific section from navigation
    if (location.state && location.state.activeSection) {
      setActiveSection(location.state.activeSection);
    }

    // Set up event listener for postMessage communication (iframe scenarios)
    const handleMessage = (event) => {
      if (event.data && event.data.action === 'setActiveSection') {
        setActiveSection(event.data.section);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [location]);

  useEffect(() => {
  window.scrollTo(0, 0);
  }, [activeSection]);

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
  
      <div className="dashboard-container">
        <nav className="sidebar">
          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'home' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('home')}
          >
            <div className="flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <span>Home</span>
          </button>

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
              activeSection === 'StatusChanger' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('StatusChanger')}
          >
            <div className="flex-shrink-0">
              <ToggleLeft className="w-5 h-5" />
            </div>
            <span>Status Changer</span>
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
            <span>Manage Customers</span>
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

          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'payments' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('payments')}
          >
            <div className="flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <span>Payments</span>
          </button>

          <button 
            className={`w-full text-left p-4 mb-2 rounded flex items-center space-x-4 ${
              activeSection === 'reports' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('reports')}
          >
            <div className="flex-shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <span>Reports</span>
          </button>
        </nav>

        <main className="content-area">
          {activeSection === 'home' && (
            <div className="section-container">
              <h2>Home</h2>
              <HomeUi />
            </div>
          )}
          {activeSection === 'bookings' && (
            <div className="section-container">
              <h2>Manage Bookings</h2>
              <ManageBookings />
            </div>
          )}          {activeSection === 'packages' && (
            <div className="section-container">
              <h2>Manage Packages</h2>
              <div className="package-submenu">
                <button 
                  className={`submenu-btn ${packageSubMenu === 'packages' ? 'active' : ''}`}
                  onClick={() => setPackageSubMenu('packages')}
                >
                  Packages
                </button>
                <button 
                  className={`submenu-btn ${packageSubMenu === 'items' ? 'active' : ''}`}
                  onClick={() => setPackageSubMenu('items')}
                >
                  Package Items
                </button>
                <button 
                  className={`submenu-btn ${packageSubMenu === 'details' ? 'active' : ''}`}
                  onClick={() => setPackageSubMenu('details')}
                >
                  Package Details
                </button>
              </div>
              
              {packageSubMenu === 'packages' && <ManagePackages />}
              {packageSubMenu === 'items' && <ManagePackageItems />}
              {packageSubMenu === 'details' && <ManagePackageDetails />}
            </div>
          )}
          {activeSection === 'StatusChanger' && (
            <div className="section-container">
              <h2>Status Changer</h2>
              <StatusChanger />
            </div>  
          )}
          {activeSection === 'users' && (
            <div className="section-container">
              <h2>Manage Customers</h2>
              <CustomerManagement />
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
          {activeSection === 'payments' && (
            <div className="section-container">
              <h2>Payments</h2>
              <Payments />
            </div>
          )}
          {activeSection === 'reports' && (
            <div className="section-container">
              <h2>Reports</h2>
              <Reports />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;