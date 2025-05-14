import { useState, useEffect, useContext } from 'react';
import './Events.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { ArrowLeft, Calendar, MapPin, Clock, CreditCard, Phone, Mail, Home, Check, X } from 'lucide-react';

const Events = () => {
  // Updated state to store user bookings
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { url } = useContext(StoreContext);
  const [error, setError] = useState(null);
  const [packages, setPackages] = useState({});
  // New states for detailed view
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  // get the userid from local storage]
  // userData	{"userID":7,"username":"Customer02","email":"customer02@gmail.com","role":"customer"}
  const userData = JSON.parse(localStorage.getItem('userData'));;

  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/bookings/user/${userData.userID}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const bookingdata = response.data;
      if (!bookingdata) {
        throw new Error('Failed to fetch bookings');
      }
      setBookings(bookingdata);
      setError(null);
      
      // Fetch package details for each booking
      await Promise.all(bookingdata.map(booking => fetchPackageDetails(booking.packageId)));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchPackageDetails = async (packageId) => {
    try {
      const response = await axios.get(`${url}/api/packages/${packageId}`);
      setPackages(prevPackages => ({
        ...prevPackages,
        [packageId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching package ${packageId}:`, error);
    }
  };

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchUserBookings();
  }, []);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to render booking status with appropriate styling
  const renderStatus = (status) => {
    if (!status) return null;
    
    let statusClass = '';
    const statusLower = status.toLowerCase();
    
    // Handle booking statuses
    if (statusLower === 'confirmed') {
      statusClass = 'status-confirmed';
    } else if (statusLower === 'pending') {
      statusClass = 'status-pending';
    } else if (statusLower === 'pencil') {
      statusClass = 'status-pencil';
    } else if (statusLower === 'completed') {
      statusClass = 'status-completed';
    } else if (statusLower === 'cancelled') {
      statusClass = 'status-cancelled';
    } 
    // Handle payment statuses
    else if (statusLower === 'paid') {
      statusClass = 'status-paid';
    } else if (statusLower.includes('partially')) {
      statusClass = 'status-partially-paid';
    } else if (statusLower === 'unpaid') {
      statusClass = 'status-unpaid';
    } else {
      statusClass = 'status-default';
    }
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  // Calculate payment status based on balance
  const calculatePaymentStatus = (invested, balance) => {
    if (!invested || !balance) return 'Unknown';
    
    if (parseFloat(balance) === 0) {
      return 'Paid';
    } else if (parseFloat(balance) < parseFloat(invested)) {
      return 'Partially Paid';
    } else {
      return 'Unpaid';
    }
  };

  // View a specific booking
  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailView(true);
    setPaymentAmount(parseFloat(booking.balanceAmount) || 0);
  };

  // Go back to the bookings list
  const backToBookingsList = () => {
    setIsDetailView(false);
    setSelectedBooking(null);
    setPaymentAmount(0);
    setReceiptFile(null);
    setPaymentError(null);
    setPaymentSuccess(false);
  };

  // Handle file upload for bank transfer
  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  // Calculate payment progress percentage
  const calculatePaymentProgress = (invested, balance) => {
    if (!invested || !balance) return 0;
    
    const total = parseFloat(invested);
    const remaining = parseFloat(balance);
    const paid = total - remaining;
    
    return Math.round((paid / total) * 100);
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsPaymentProcessing(true);
    setPaymentError(null);
    
    try {
      const formData = new FormData();
      formData.append('bookingId', selectedBooking.bookingId);
      formData.append('amount', paymentAmount);
      formData.append('paymentMethod', paymentMethod);
      // append the reference number if payment method is bank transfer
      
      if (paymentMethod === 'bankTransfer' && receiptFile) {
        formData.append('receipt', receiptFile);
        formData.append('referenceNumber', referenceNumber);
      }

      // print the form data
      console.log('Form Data:', Object.fromEntries(formData.entries()));
      const response = await axios.post(`${url}/api/bookings/payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setPaymentSuccess(true);
      
      // Update the booking in state
      const updatedBooking = response.data;
      setBookings(bookings.map(b => 
        b.bookingId === updatedBooking.bookingId ? updatedBooking : b
      ));
      
      // Update the selected booking
      setSelectedBooking(updatedBooking);
      
      // Reset form
      setPaymentAmount(0);
      setReceiptFile(null);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Render bookings or "No Bookings" message
  const renderBookingContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your bookings...</p>
        </div>
      );
    }    
    
    if (bookings.length === 0) {
      return (
        <div className="no-bookings">
          <div className="no-bookings-icon">📅</div>
          <h2>No Bookings Found</h2>
          <p>You haven't made any photography bookings yet.</p>
          <button className="create-booking-btn">Book a Session Now</button>
        </div>
      );
    }

    return (      
      <div className="bookings-container">
        {bookings.map((booking) => {
          const packageInfo = packages[booking.packageId] || {};
          const paymentStatus = calculatePaymentStatus(booking.investedAmount, booking.balanceAmount);
          
          return (
            <div key={booking.bookingId} className="booking-card">
              <div className="booking-header">
                <h3>{booking.eventName || 'Untitled Booking'} Booking</h3>
                <div className="booking-date">{formatDate(booking.eventDate)}</div>
              </div>
              <div className="booking-details">
                <div className="customer-info">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {booking.fullName}</p>
                  <p><strong>Email:</strong> {booking.email}</p>
                  <p><strong>Address:</strong> {booking.billingAddress}</p>
                  <p><strong>Phone:</strong> {booking.billingMobile}</p>
                </div>
                
                <div className="package-info">
                  <h4>Package Details</h4>
                  <p><strong>Package:</strong> {booking.packageName}</p>
                  <p><strong>Type:</strong> {packageInfo.packageTierName || 'Standard'}</p>
                  <p><strong>Coverage:</strong> {booking.coverageHours} hours</p>
                  <p><strong>Total Price:</strong> LKR {parseFloat(booking.investedAmount).toLocaleString()}</p>
                  <p><strong>Balance Due:</strong> LKR {parseFloat(booking.balanceAmount).toLocaleString()}</p>
                  {packageInfo.details && (
                    <p className="booking-description"><strong>Package Details:</strong> {packageInfo.details}</p>
                  )}
                </div>
                
                <div className="event-info">
                  <h4>Event Details</h4>
                  <p><strong>Event Date:</strong> {formatDate(booking.eventDate)}</p>
                  <p><strong>Event Time:</strong> {booking.eventTime}</p>
                  <p><strong>Venue:</strong> {booking.venue}</p>
                  {booking.notes && (
                    <p className="booking-description"><strong>Notes:</strong> {booking.notes}</p>
                  )}
                </div>
              </div>
              <div className="booking-status-container">
                <div className="status-item">
                  <span className="status-label">Payment:</span>
                  {renderStatus(paymentStatus)}
                </div>
                <div className="status-item">
                  <span className="status-label">Booking:</span>
                  {renderStatus(booking.bookingStatus)}
                </div>
              </div>              <div className="booking-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => viewBookingDetails(booking)}
                >
                  View Booking Details
                </button>
                {booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && (
                  <button className="cancel-booking-btn">Cancel Booking</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="events-page">
      {isDetailView && selectedBooking ? (
        <div className="booking-detail-view">
          <div className="detail-header">
            <button 
              className="back-btn"
              onClick={backToBookingsList}
            >
              <ArrowLeft size={20} /> Back to Bookings
            </button>
            <h1>Booking Details</h1>
          </div>

          <div className="booking-progress-container">
            <div className="booking-status-header">
              <h3>Booking Progress</h3>
              <div className="status-badge-large">{selectedBooking.bookingStatus}</div>
            </div>
            
            <div className="booking-progress">
              <div className="progress-step completed">
                <div className="step-icon"><Check size={20} /></div>
                <div className="step-label">Created</div>
              </div>
              <div className="progress-connector"></div>
              
              <div className={`progress-step ${selectedBooking.bookingStatus !== 'Pending' ? 'completed' : 'pending'}`}>
                <div className="step-icon">{selectedBooking.bookingStatus !== 'Pending' ? <Check size={20} /> : 2}</div>
                <div className="step-label">Confirmed</div>
              </div>
              <div className="progress-connector"></div>
              
              <div className={`progress-step ${selectedBooking.bookingStatus === 'Completed' ? 'completed' : 'pending'}`}>
                <div className="step-icon">{selectedBooking.bookingStatus === 'Completed' ? <Check size={20} /> : 3}</div>
                <div className="step-label">Completed</div>
              </div>
            </div>
          </div>

          <div className="booking-detail-grid">
            <div className="detail-section">
              <h3>Event Information</h3>
              <div className="detail-card">
                <div className="detail-row">
                  <Calendar size={18} />
                  <div>
                    <strong>Event Date:</strong> {formatDate(selectedBooking.eventDate)}
                  </div>
                </div>
                <div className="detail-row">
                  <Clock size={18} />
                  <div>
                    <strong>Event Time:</strong> {selectedBooking.eventTime}
                  </div>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-row">
                  <MapPin size={18} />
                  <div>
                    <strong>Venue:</strong> {selectedBooking.venue}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-card">
                <div className="detail-row">
                  <Phone size={18} />
                  <div>
                    <strong>Phone:</strong> {selectedBooking.billingMobile}
                  </div>
                </div>
                <div className="detail-row">
                  <Mail size={18} />
                  <div>
                    <strong>Email:</strong> {selectedBooking.email}
                  </div>
                </div>
              </div>
              <div className="detail-card">
              <div className="detail-row">
                  <Home size={18} />
                  <div>
                    <strong>Address:</strong> {selectedBooking.billingAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section payment-summary-section">
              <h3>Payment Summary</h3>
              <div className="detail-card">
                <div className="payment-summary">
                  <div className="payment-item">
                    <span className="payment-label">Total Amount:</span>
                    <span className="payment-value">LKR {parseFloat(selectedBooking.investedAmount).toLocaleString()}</span>
                  </div>
                  <div className="payment-item">
                    <span className="payment-label">Paid Amount:</span>
                    <span className="payment-value">LKR {(parseFloat(selectedBooking.investedAmount) - parseFloat(selectedBooking.balanceAmount)).toLocaleString()}</span>
                  </div>
                  <div className="payment-item highlight">
                    <span className="payment-label">Balance Due:</span>
                    <span className="payment-value">LKR {parseFloat(selectedBooking.balanceAmount).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="payment-progress">
                  <div className="progress-label">
                    <span>Payment Progress</span>
                    <span>{calculatePaymentProgress(selectedBooking.investedAmount, selectedBooking.balanceAmount)}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${calculatePaymentProgress(selectedBooking.investedAmount, selectedBooking.balanceAmount)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>            
            
            {parseFloat(selectedBooking.balanceAmount) > 0 && !paymentSuccess && (
              <div className="detail-section make-payment-section">
                <h3>Make a Payment</h3>
                <div className="detail-card">
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="payment-form-grid">
                      <div className="payment-form-left">
                        <div className="form-group">
                          <label>Payment Method</label>
                          <div className="payment-method-selector">
                            <div 
                              className={`payment-method ${paymentMethod === 'bankTransfer' ? 'selected' : ''}`}
                              onClick={() => setPaymentMethod('bankTransfer')}
                            >
                              <div className="method-radio">
                                <input 
                                  type="radio" 
                                  name="paymentMethod" 
                                  checked={paymentMethod === 'bankTransfer'} 
                                  onChange={() => setPaymentMethod('bankTransfer')}
                                />
                              </div>
                              <div className="method-label">Bank Transfer</div>
                            </div>
                            <div 
                              className={`payment-method ${paymentMethod === 'creditCard' ? 'selected' : ''}`}
                              onClick={() => setPaymentMethod('creditCard')}
                            >
                              <div className="method-radio">
                                <input 
                                  type="radio" 
                                  name="paymentMethod" 
                                  checked={paymentMethod === 'creditCard'} 
                                  onChange={() => setPaymentMethod('creditCard')}
                                />
                              </div>
                              <div className="method-label">Credit Card</div>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Payment Amount</label>
                          <div className="payment-amount-input">
                            <span className="currency-symbol">LKR</span>
                            <input
                              type="number"
                              min="1"
                              max={selectedBooking.balanceAmount}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              required
                            />
                          </div>
                          <div className="balance-info">
                            <p>Remaining balance: LKR {parseFloat(selectedBooking.balanceAmount).toLocaleString()}</p>
                          </div>
                        </div>

                        {paymentMethod === 'creditCard' && (
                          <div className="credit-card-details">
                            <div className="form-group">
                              <label>Card Number</label>
                              <input 
                                type="text" 
                                placeholder="1234 5678 9012 3456" 
                                maxLength="19"
                                className="card-input"
                              />
                            </div>
                            <div className="card-row">
                              <div className="form-group half">
                                <label>Expiry Date</label>
                                <input 
                                  type="text" 
                                  placeholder="MM/YY"
                                  maxLength="5"
                                  className="card-input"
                                />
                              </div>
                              <div className="form-group half">
                                <label>CVV</label>
                                <input 
                                  type="text" 
                                  placeholder="123"
                                  maxLength="3"
                                  className="card-input"
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Cardholder Name</label>
                              <input 
                                type="text" 
                                placeholder="John Smith"
                                className="card-input"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="payment-form-right">
                        {paymentMethod === 'bankTransfer' && (
                          <>
                            <div className="form-group">
                              <label>Upload Payment Receipt</label>
                              <div className="file-upload">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  required
                                />
                                <p className="file-instructions">
                                  Please upload an image of your bank transfer receipt
                                </p>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Reference Number</label>
                              <input
                                type="text"
                                placeholder="Bank transfer reference number"
                                className="reference-input"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                              />
                              <p className="reference-info">
                                Enter the reference number from your bank transfer
                              </p>
                            </div>
                            <div className="bank-details">
                              <h4>Bank Account Details</h4>
                              <p><strong>Bank:</strong> Bank of Ceylon </p>
                              <p><strong>Account Name:</strong> Pathum L Weerasinghe Photography</p>
                              <p><strong>Account Number:</strong> 85471234 </p>
                              <p><strong>Branch:</strong> Kegalle Branch </p>
                            </div>
                          </>
                        )}

                        {paymentMethod === 'creditCard' && (
                          <div className="card-info-section">
                            <div className="secure-payment-info">
                              <div className="secure-icon">🔒</div>
                              <h4>Secure Payment</h4>
                              <p>Your payment information is encrypted and secure. We do not store your credit card details.</p>
                            </div>
                            <div className="card-brands">
                              <p>We accept:</p>
                              <div className="brand-icons">
                                <span className="card-brand">Visa</span>
                                <span className="card-brand">MasterCard</span>
                                <span className="card-brand">Amex</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {paymentError && (
                      <div className="error-message">
                        {paymentError}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="pay-now-btn"
                      disabled={isPaymentProcessing || !paymentAmount || (paymentMethod === 'bankTransfer' && !receiptFile)}
                    >
                      {isPaymentProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {paymentSuccess && (
              <div className="detail-section payment-success-section">
                <div className="payment-success-message">
                  <div className="success-icon">✓</div>
                  <h3>Payment Successful!</h3>
                  <p>Your payment has been processed successfully.</p>
                  <button 
                    className="back-to-details-btn"
                    onClick={() => {
                      setPaymentSuccess(false);
                      fetchUserBookings();
                    }}
                  >
                    Back to Booking Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <h1>My Bookings</h1>
          {renderBookingContent()}
        </>
      )}
    </div>
  );
};

export default Events;