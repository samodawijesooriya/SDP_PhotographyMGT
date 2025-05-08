import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvoiceGenerator from './InvoiceGenerator';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [emailSent, setEmailSent] = useState(false); // Add this missing state variable
  const { bookingData } = location.state || {};
  
  useEffect(() => {
    // Check if booking data exists
    if (!bookingData) {
      navigate('/booking');
      return;
    }
    console.log('Booking Data:', bookingData);
    // Generate a random invoice number (in production, this would come from the backend)
    const randomInvoice = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setInvoiceNumber(randomInvoice);

    // Send confirmation email
    sendConfirmationEmail(bookingData, randomInvoice);
    
    // Show success message
    const successAlert = setTimeout(() => {
      setShowInvoice(true);
    }, 2000);
    
    return () => clearTimeout(successAlert);
  }, [bookingData, navigate]);

  // Updated sendConfirmationEmail function
  const sendConfirmationEmail = async (data, invoice) => {
    try {
      const response = await fetch('http://localhost:4001/api/email/sendBookingConfirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.fullName,
          sessionType: data.eventType,
          date: data.eventDate,
          time: data.eventTime,
          location: data.venue,
          price: data.totalAamount,
          invoiceNumber: invoice
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
  
  return (
    <div className="payment-success-container">
      <div className={`success-message ${showInvoice ? 'fade-out' : ''}`}>
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>Booking Created Successfully!</h1>
        <p>Your photography session has been booked.</p>
        <p>Processing your invoice...</p>
        {emailSent && <p className="email-sent">Confirmation email sent to {bookingData.email}</p>}
      </div>
      
      {showInvoice && (
        <div className="invoice-section fade-in">
          <h2>Your Booking Invoice</h2>

          {/* Add email status information */}
          <div className="email-status">
            {emailSent ? (
              <p className="email-confirmation"> Confirmation email sent to {bookingData.email}</p>
            ) : (
              <div className="email-error">
                <p>We couldn't send your confirmation email. Don't worry, your booking is still confirmed.</p>
                
              </div>
            )}
          </div>

          <InvoiceGenerator 
            bookingData={bookingData}
            invoiceNumber={invoiceNumber}
          />
          
          
          
          <div className="action-buttons">
            <button className="dashboard-btn" onClick={() => navigate('/')}>
              Go to Home
            </button>
            <button className="book-another-btn" onClick={() => navigate('/booking')}>
              Book Another Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;