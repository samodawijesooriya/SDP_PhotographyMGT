// BookingSuccess.jsx
import { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Booking-success.css'; // You'll need to create this CSS file
import Footer from '../../components/Footer/Footer';
import { StoreContext } from '../../context/StoreContext';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const { url } = useContext(StoreContext);
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fetchPackages = async () => {
    try {
        setLoading(true);
        
        // Guard clause in case bookingData or packageId is undefined
        if (!bookingData || !bookingData.packageId) {
            throw new Error('Missing booking data or package ID');
        }
        
        const response = await fetch(`${url}/api/packages/${bookingData.packageId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch packages: ${response.status}`);
        }
        
        const data = await response.json();
        
        setPackages(data);
        setError(null);
        console.log('Fetched packages:', data);  // Fixed: removed transformedData reference
    } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Failed to fetch packages. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  // send pencil confirmation email
  const sendConfirmationEmailPencil = async (data) => {
    try {
      const response = await fetch('http://localhost:4001/api/email/pencilConfirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.fullName,
          billingMobile: data.billingMobile,
          packageName: packages.packageName,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setEmailSent(true);
        console.log('Confirmation email sent successfully');
      } else {
        setEmailSent(false);
        console.error('Failed to send confirmation email:', result.message);
      }
    } catch (error) {
      setEmailSent(false);
      console.error('Error sending confirmation email:', error);
    }
  };
  
  useEffect(() => {
    // Get booking data from navigation state
    if (location.state && location.state.bookingData) {
      setBookingData(location.state.bookingData);
      // We'll call fetchPackages after setting booking data in a separate useEffect
    } else {
      // If no booking data, redirect to booking page
      navigate('/booking');
    }
  }, [location, navigate]);

  // Add a new useEffect to fetch package data once bookingData is available
  useEffect(() => {
    if (bookingData && bookingData.packageId) {
      fetchPackages();
      sendConfirmationEmailPencil(bookingData);
    }
  }, [bookingData]);

  // If no booking data yet, show loading
  if (!bookingData) {
    return <div className="loading">Loading booking information...</div>;
  }


  // Check if this is a pencil booking
  const isPencilBooking = bookingData.bookingStatus === 'Pencil';

  return (
    <div className="booking-success-container">
      <div className="success-content">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h1>Booking Successful!</h1>
          <div className="pencil-booking-message">
            <p>Your pencil booking has been successfully created.</p>
            <p>This booking is held without a deposit and no invoice has been generated.</p>
            <p>Our team will contact you shortly to discuss next steps.</p>
            
            <div className="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Customer:</strong> {bookingData.fullName}</p>
              <p><strong>Email:</strong> {bookingData.email}</p>
              <p><strong>Phone:</strong> {bookingData.billingMobile}</p>
              <p><strong>Package:</strong> {loading ? 'Loading...' : (packages.packageName || 'Unknown package')}</p>
              {bookingData.notes && (
                <p><strong>Notes:</strong> {bookingData.notes}</p>
              )}
            </div>
            
            <p className="email-status">
              {emailSent ? (
                <span className="email-confirmation">A confirmation email with these details has been sent to {bookingData.email}.
                Please note that pencil bookings are temporary reservations and will expire after 7 days.</span>
              ) : (
                <div className="email-error">
                <span className="email-error">Confirmation email not sent. Please check your email.</span>
                <button 
                  className="resend-email-btn" 
                  onClick={() => sendConfirmationEmailPencil(bookingData)}
                >
                  Resend Email
                </button>
                </div>
              )}
              
            </p>
          </div>
        
        <div className="action-buttons">
          <Link to="/" className="home-btn">
            Return to Home
          </Link>
          <Link to="/dashboard" className="dashboard-btn">
            Go to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;