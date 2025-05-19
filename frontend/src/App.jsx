import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import AboutMe from './pages/AboutUs/AboutMe';
import Gallery from './pages/Gallery/Gallery';
import Contact from './pages/Contact/Contact';
import LoginPopup from './components/LoginPopup/LoginPopup';
import StoreContextProvider from './context/StoreContext';
import Album from './pages/Albums/Album';
import Booking from './pages/Booking/Booking';
import YourBookings from '../src/pages/YourBookings/Events';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserView from './pages/AdminView/UserView/UserView';
import Packages from './pages/Packages/Packages';
import { AuthProvider, useAuth } from './context/AuthContext';
import NotFound from './components/NotFound/NotFound';
import PaymentSuccess from '../src/pages/Booking/PaymentSuccess';
import BookingSuccess from './pages/Booking/Booking-success';
import AlbumList from './pages/Albums/AlbumList';

// Protected route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protected route for photographer role
const PhotographerRoute = ({ children }) => {
  const { isPhotographer, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isPhotographer) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected route for admin role
const AdminRoute = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Login page component
const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  return <LoginPopup />;
};

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <div>
          <Navbar setShowLogin={setShowLogin} />
        </div>
        <Routes>
          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<AboutMe />} />
          <Route path='/gallery/:albumId' element={<Gallery />} />
          <Route path='/contact' element={<Contact />} />
          <Route path="/events" element={<YourBookings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/album" element={<AlbumList />} />

          {/* Protected routes - require authentication */}
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute>
                <Booking setShowLogin={setShowLogin} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/packages" 
            element={
              <ProtectedRoute>
                <Packages />
              </ProtectedRoute>
            } 
          />
          
          {/* Photographer only routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <PhotographerRoute>
                <AdminDashboard />
              </PhotographerRoute>
            } 
          />
          
          {/* Admin only routes */}
          <Route 
            path="/userView" 
            element={
              <AdminRoute>
                <UserView />
              </AdminRoute>
            } 
          />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />

          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/booking-success" element={<BookingSuccess />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <StoreContextProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </StoreContextProvider>
  );
};

export default App;