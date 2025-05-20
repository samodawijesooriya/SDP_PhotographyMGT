import React, { useState, useEffect, useContext } from 'react';
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
  // Cancel booking states
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // get the userid from local storage]
  // userData	{"userID":7,"username":"Customer02","email":"customer02@gmail.com","role":"customer"}
  const userData = JSON.parse(localStorage.getItem('userData'));
  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/bookings/user/${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const bookingdata = response.data;
      if (!bookingdata) {
        throw new Error('Failed to fetch bookings');
      }
      
      // Process bookings: if bookingType is CompletedBooking, set the bookingStatus to match the delivery stage
      const processedBookings = bookingdata.map(booking => {
        if (booking.bookingType === 'CompletedBooking') {
          // If it doesn't already have a valid delivery stage status, set it to "Completed" 
          // (first stage of delivery progress)
          if (!deliveryStages.some(stage => stage.status === booking.bookingStatus)) {
            return { ...booking, bookingStatus: 'Completed' };
          }
        }
        return booking;
      });
      
      setBookings(processedBookings);
      setError(null);
      
      // Fetch package details for each booking
      await Promise.all(processedBookings.map(booking => fetchPackageDetails(booking.packageId)));
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
    // Process booking to ensure proper delivery stage is set if needed
    let processedBooking = { ...booking };
    
    // If this is a completed booking type but doesn't have a delivery stage status,
    // set it to the first delivery stage (Completed)
    if (isCompletedBookingType(processedBooking) && 
        !isInDeliveryStage(processedBooking)) {
      processedBooking.bookingStatus = 'Completed';
    }
    
    setSelectedBooking(processedBooking);
    setIsDetailView(true);
    setPaymentAmount(parseFloat(processedBooking.balanceAmount) || 0);
  };

  // Go back to the bookings list
  const backToBookingsList = () => {
    setIsDetailView(false);
    setSelectedBooking(null);
    setPaymentAmount(0);
    setReceiptFile(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    setCancelSuccess(false);
  };

  // Handle showing cancel confirmation
  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setConfirmCancel(true);
  };

  // Confirm cancellation
  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      setIsCancelling(true);
      
      const response = await axios.post(
        `${url}/api/bookings/cancel/${bookingToCancel.bookingId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.status === 200) {
        // Update the booking status in the local state
        setBookings(bookings.map(b => 
          b.bookingId === bookingToCancel.bookingId 
            ? { ...b, bookingStatus: 'Cancelled' } 
            : b
        ));
        
        setCancelSuccess(true);
        setConfirmCancel(false);
        
        // If canceling from detail view, update the selected booking
        if (selectedBooking && selectedBooking.bookingId === bookingToCancel.bookingId) {
          setSelectedBooking({...selectedBooking, bookingStatus: 'Cancelled'});
        }
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
      setBookingToCancel(null);
    }
  };
  
  // Cancel the cancellation
  const cancelCancellation = () => {
    setConfirmCancel(false);
    setBookingToCancel(null);
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
      formData.append('paymentAmount', paymentAmount);
      formData.append('paymentMethod', paymentMethod);
      // append the reference number if payment method is bank transfer
      
      if (paymentMethod === 'bankTransfer' && receiptFile) {
        formData.append('receipt', receiptFile);
        formData.append('referenceNumber', referenceNumber);
      }

      const data = {
        bookingId: selectedBooking.bookingId,
        paymentAmount: paymentAmount,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber
      };

      // print the form data
      console.log('Form Data:', data);
      const response = await axios.post(`${url}/api/payment/create`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }); 
      setPaymentSuccess(true);
      
      // Update the booking in state
      const updatedBooking = response.data;
      
      // Process the updated booking to set the correct delivery stage if needed
      if (updatedBooking.bookingType === 'CompletedBooking' && 
          !deliveryStages.some(stage => stage.status === updatedBooking.bookingStatus)) {
        updatedBooking.bookingStatus = 'Completed'; // Set to first delivery stage
      }
      
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
    }    return (      
      <div className="your-bookings-container">
        {bookings.map((booking) => {
          const packageInfo = packages[booking.packageId] || {};
          const paymentStatus = calculatePaymentStatus(booking.investedAmount, booking.balanceAmount);
          
          return (
            <div key={booking.bookingId} className="your-booking-card">
              <div className="your-booking-header">
                <h3>{booking.eventName || 'Untitled Booking'} Booking</h3>
                <div className="your-booking-date">{formatDate(booking.eventDate)}</div>
              </div>
              <div className="your-booking-details">
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
              </div>              <div className="your-booking-status-container">
                <div className="status-item">
                  <span className="status-label">Payment:</span>
                  {renderStatus(paymentStatus)}
                </div>
                <div className="status-item">
                  <span className="status-label">Booking:</span>
                  {renderStatus(booking.bookingStatus)}
                </div>
              </div>              
              <div className="your-booking-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => viewBookingDetails(booking)}
                >
                  View Booking Details
                </button>                
                {booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Completed' && (
                  <button 
                    className="cancel-booking-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
                        axios.post(
                          `${url}/api/bookings/cancel/${booking.bookingId}`,
                          {},
                          {
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          }
                        )
                        .then(response => {
                          if (response.status === 200) {
                            // Update booking status in the local state
                            setBookings(prevBookings => 
                              prevBookings.map(b => 
                                b.bookingId === booking.bookingId 
                                  ? { ...b, bookingStatus: 'Cancelled' } 
                                  : b
                              )
                            );
                            alert('Booking has been cancelled successfully.');
                          }
                        })
                        .catch(error => {
                          console.error('Error cancelling booking:', error);
                          alert('Failed to cancel booking. Please try again.');
                        });
                      }
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  // Helper functions for delivery stages
  const isCompletedBookingType = (booking) => {
    return booking && booking.bookingType === 'CompletedBooking';
  };

  const isInDeliveryStage = (booking) => {
    return booking && deliveryStages.some(stage => stage.status === booking.bookingStatus);
  };

  const shouldShowDeliveryProgress = (booking) => {
    return isCompletedBookingType(booking) || isInDeliveryStage(booking);
  };

  // Define the 5 stages of the delivery process
  const deliveryStages = [
    { id: 1, name: "Completed Booking", status: "Completed", progress: 0 },
    { id: 2, name: "Image Editing", status: "ImageEditing", progress: 25 },
    { id: 3, name: "Preparing Other Items", status: "PreparingItems", progress: 50 },
    { id: 4, name: "Finalizing", status: "Finalizing", progress: 75 },
    { id: 5, name: "Finished", status: "Finished", progress: 100 }
  ];

  // Helper function to get current delivery stage
  const getCurrentDeliveryStage = (status) => {
    const stage = deliveryStages.find(s => s.status === status);
    return stage ? stage : deliveryStages[0]; // Default to first stage if not found
  };

  // Helper function to determine stage class
  const getDeliveryStageClass = (stageIndex, currentStageIndex) => {
    if (stageIndex === currentStageIndex) {
      return "active";
    } else if (stageIndex < currentStageIndex) {
      return "completed";
    } else {
      return "pending";
    }
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
                <div className="step-icon">{selectedBooking.bookingStatus !== 'Pending' ? <Check size={20} /> : '2'}</div>
                <div className="step-label">Confirmed</div>
              </div>
              <div className="progress-connector"></div>
              
              <div className={`progress-step ${selectedBooking.bookingStatus === 'Completed' || selectedBooking.bookingStatus === 'Cancelled' ? selectedBooking.bookingStatus.toLowerCase() : 'pending'}`}>
                <div className="step-icon">
                  {selectedBooking.bookingStatus === 'Completed' ? <Check size={20} /> : selectedBooking.bookingStatus === 'Cancelled' ? <X size={20} /> : '3'}
                </div>
                <div className="step-label">{selectedBooking.bookingStatus === 'Cancelled' ? 'Cancelled' : 'Completed'}</div>
              </div>
            </div>
          </div>          {/* Delivery Progress Tracker - Show for CompletedBooking type or when bookingStatus matches a delivery stage */}
          {shouldShowDeliveryProgress(selectedBooking) && (
            <div className="delivery-progress-container">
              <div className="delivery-status-header">
                <h3>Delivery Progress</h3>
                <div className="delivery-badge-large">
                  {deliveryStages.find(stage => stage.status === selectedBooking.bookingStatus)?.name || 'Completed Booking'}
                </div>
              </div>
              
              <div className="delivery-progress">
                {deliveryStages.map((stage, index) => {
                  // Find the current stage index
                  const currentStageIndex = deliveryStages.findIndex(s => s.status === selectedBooking.bookingStatus);
                  // If nothing found, default to the first stage (Completed Booking)
                  const actualStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
                  // Determine the class for this stage
                  const stageClass = getDeliveryStageClass(index, actualStageIndex);
                  
                  return (
                    <React.Fragment key={stage.id}>
                      <div className={`delivery-step ${stageClass}`}>
                        <div className="delivery-icon">
                          {stageClass === 'completed' ? <Check size={18} /> : stage.id}
                        </div>
                        <div className="delivery-label">{stage.name}</div>
                      </div>
                      
                      {index < deliveryStages.length - 1 && (
                        <div className="delivery-connector"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              
              <div className="delivery-stage-description">
                {selectedBooking.bookingStatus === 'Completed' && (
                  <p>Your booking is complete. We'll begin processing your photos soon.</p>
                )}
                {selectedBooking.bookingStatus === 'ImageEditing' && (
                  <p>We're currently editing your images to ensure they look their best.</p>
                )}
                {selectedBooking.bookingStatus === 'PreparingItems' && (
                  <p>Your images are edited and we're now preparing any additional items included in your package.</p>
                )}
                {selectedBooking.bookingStatus === 'Finalizing' && (
                  <p>We're finalizing everything and preparing for delivery.</p>
                )}
                {selectedBooking.bookingStatus === 'Finished' && (
                  <p>Great news! Your photos and package items are ready. We'll contact you for delivery arrangements.</p>
                )}
              </div>
            </div>
          )}

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
            {selectedBooking.bookingStatus === 'Cancelled' && (
                <div className="refund-notification">
                  Please note: If a booking is canceled, the advanced payment of 20,000 LKR will not be returned. This is according to our cancelation policy.
                </div>
              )}
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
                  </div>                </div>
              </div>
                
            </div>            
              {parseFloat(selectedBooking.balanceAmount) > 0 && !paymentSuccess && selectedBooking.bookingStatus !== 'Cancelled' && (
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

            {confirmCancel && (
              <div className="detail-section cancel-confirmation-section">
                <div className="cancel-confirmation-message">
                  <div className="confirmation-icon">⚠️</div>
                  <h3>Are you sure you want to cancel this booking?</h3>
                  <p>This action cannot be undone.</p>
                  <div className="confirmation-actions">                    
                    <button 
                      className="confirm-cancel-btn"
                      onClick={confirmCancelBooking}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                    </button>
                    <button 
                      className="cancel-cancel-btn"
                      onClick={cancelCancellation}
                      disabled={isCancelling}
                    >
                      No, Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cancelSuccess && (
              <div className="detail-section cancel-success-section">
                <div className="cancel-success-message">
                  <div className="success-icon">✓</div>
                  <h3>Booking Cancelled Successfully!</h3>
                  <p>Your booking has been cancelled.</p>
                  <button 
                    className="back-to-details-btn"
                    onClick={() => {
                      setCancelSuccess(false);
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