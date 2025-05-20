import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './StatusChanger.css';
import { StoreContext } from '../../../context/StoreContext';

const StatusChanger = () => {
  const { url } = useContext(StoreContext);
  const [doneBookings, setDoneBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStage, setSelectedStage] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Define the 5 stages of the booking process
  const stages = [
    { id: 1, name: "Completed Booking", status: "Completed", progress: 0 },
    { id: 2, name: "Image Editing", status: "ImageEditing", progress: 25 },
    { id: 3, name: "Preparing Other Items", status: "PreparingItems", progress: 50 },
    { id: 4, name: "Finalizing", status: "Finalizing", progress: 75 },
    { id: 5, name: "Finished", status: "Finished", progress: 100 }
  ];

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${url}/api/bookings/status/done`);
      console.log('Refreshed done bookings:', response.data.bookings);
      
      // Process bookings to include their progress based on status
      const processedBookings = (response.data.bookings || []).map(booking => {
        // Ensure all bookings have at least the "Completed" status if none is set
        if (!booking.bookingStatus || !stages.some(s => s.status === booking.bookingStatus)) {
          booking.bookingStatus = "Completed";
        }
        return {
          ...booking,
          email: booking.email || booking.customerEmail || '',
          billingMobile: booking.billingMobile || booking.mobile || '',
          fullName: booking.fullName || booking.customerName || ''
        };
      });
      
      setDoneBookings(processedBookings);
      setSuccessMessage("Bookings refreshed successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to refresh bookings');
      console.error(err);
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch bookings with "Completed" status or any of the other stages
    const fetchDoneBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/bookings/status/done`);
        console.log('Fetched done bookings:', response.data.bookings);
        
        // Process bookings to include their progress based on status
        const processedBookings = (response.data.bookings || []).map(booking => {
          // Ensure all bookings have at least the "Completed" status if none is set
          if (!booking.bookingStatus || !stages.some(s => s.status === booking.bookingStatus)) {
            booking.bookingStatus = "Completed";
          }
          return {
            ...booking,
            email: booking.email || booking.customerEmail || '',
            billingMobile: booking.billingMobile || booking.mobile || '',
            fullName: booking.fullName || booking.customerName || ''
          };
        });
        
        setDoneBookings(processedBookings);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
        console.error(err);
      }
    };

    fetchDoneBookings();
  }, [url]);

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    
    // Determine which stage the booking is at based on status
    const currentStage = stages.findIndex(stage => stage.status === booking.bookingStatus);
    setSelectedStage(currentStage !== -1 ? currentStage : 0); // Default to first stage if not found
    
    setComment(booking.notes || '');
    setShowModal(true);
  };

  const handleStageChange = (index) => {
    setSelectedStage(index);
  };

  const handleSliderChange = (e) => {
    const sliderValue = parseInt(e.target.value);
    setSelectedStage(sliderValue);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const currentStage = stages[selectedStage];
      console.log('Selected stage:', currentStage.status); 
      
      // Update booking status to the selected stage and add comment to notes
      await axios.put(
        `${url}/api/bookings/save/${selectedBooking.bookingId}`,
        {
          bookingStatus: currentStage.status,
          notes: comment
        }
      );

      // Update the booking in the list
      setDoneBookings(
        doneBookings.map((booking) =>
          booking.bookingId === selectedBooking.bookingId
            ? { ...booking, bookingStatus: currentStage.status, notes: comment }
            : booking
        )
      );
      
      // Show success message
      setSuccessMessage(`Booking updated to "${currentStage.name}" stage with notes successfully`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Reset selection and close modal
      setSelectedBooking(null);
      setShowModal(false);
    } catch (err) {
      setError('Failed to update booking stage');
      console.error(err);
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBackButton = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Helper function to get progress percentage based on booking status
  const getProgressPercentage = (status) => {
    const stage = stages.find(s => s.status === status);
    return stage ? stage.progress : 0;
  };

  // Helper function to get the current stage name
  const getCurrentStageName = (status) => {
    const stage = stages.find(s => s.status === status);
    return stage ? stage.name : "Completed Booking";
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading && !selectedBooking && !showModal) {
    return <div className="status-changer-loading">Loading bookings...</div>;
  }

  // Render the status change modal view
  if (showModal && selectedBooking) {
    return (
      <div className="status-changer-modal-view">
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        <div className='MainContainer'>
            <div className="modal-header">
            <button className="back-button" onClick={handleBackButton}>
                <span className="back-icon">←</span> Back to Bookings
            </button>
            <h2>Update Booking Status</h2>
            </div>
        
          <div className="booking-info-section">
            <h3 className="section-title">Booking Information</h3>
            <div className="info-card">
              <div className="info-header">
                <h4>{selectedBooking.fullName || 'Customer'}</h4>
                <span className="status-badge">{selectedBooking.bookingStatus}</span>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">
                    <span className="icon">📅</span>
                    Event Date:
                  </span>
                  <span className="value">{formatDate(selectedBooking.eventDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">
                    <span className="icon">📦</span>
                    Package:
                  </span>
                  <span className="value">{selectedBooking.packageName || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <span className="label">
                    <span className="icon">📧</span>
                    Email:
                  </span>
                  <span className="value">{selectedBooking.email || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="label">
                    <span className="icon">📱</span>
                    Mobile:
                  </span>
                  <span className="value">{selectedBooking.billingMobile || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stage-control-section">
            <h3 className="section-title">Progress Stage</h3>
            <div className="status-card">
              <label className="control-label">Current Stage: <span className="stage-value">{stages[selectedStage].name}</span></label>
              
              <div className="slider-container">
                <div className="slider-track">
                  {stages.map((stage, index) => (
                    <div 
                      key={stage.id} 
                      className={`slider-point ${selectedStage >= index ? 'active' : ''}`}
                      onClick={() => handleStageChange(index)}
                    >
                      <span className="slider-number">{stage.id}</span>
                      <span className="slider-label">{stage.name}</span>
                    </div>
                  ))}
                  <div className="slider-progress" style={{ width: `${stages[selectedStage].progress}%` }}></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stages.length - 1}
                  step="1"
                  value={selectedStage}
                  onChange={handleSliderChange}
                  className="stage-slider"
                />
              </div>
            </div>
          </div>
          
          <div className="notes-section">
            <h3 className="section-title">Customer Notes</h3>
            <div className="notes-card">
              <label htmlFor="comment-area" className="control-label">
                <span className="icon">📝</span>
                Notes (visible to customer):
              </label>
              <textarea
                id="comment-area"
                value={comment}
                onChange={handleCommentChange}
                placeholder="Add a comment about the booking progress..."
                className="comment-textarea"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="savebtn" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              className="cancelbtn" 
              onClick={handleBackButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          </div>
        </div>
    );
  }

  // Render the main booking list view
  return (
    <div className="status-changer-container">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <h2 className="status-changer-title">Booking Progress Tracker</h2>
      
      <div className="refresh-container">
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <span className="refresh-icon">🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh Bookings'}
        </button>      
    </div>
      
      <div className="main-content">
        <div className="bookings-container">
          {doneBookings.length === 0 ? (
            <p className="no-bookings-message">No completed bookings found</p>
          ) : (
            doneBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="booking-card"
                onClick={() => handleBookingClick(booking)}
              >
              <div className="booking-header">
                <h3>{booking.fullName || 'Customer'}</h3>
                <span className="status-badge">{booking.bookingStatus}</span>
              </div>
              
              <div className="booking-details">
                <p className="event-date">
                  <span className="icon">📅</span> 
                  {formatDate(booking.eventDate)}
                </p>
                <p className="package-name">
                  <span className="icon">📦</span> 
                  {booking.packageName || 'Not specified'}
                </p>
              </div>
              
              <div className="progress-container">
                <div className="progress-track">
                  {stages.map((stage, index) => (
                    <div 
                      key={stage.id} 
                      className={`progress-point ${getProgressPercentage(booking.bookingStatus) >= stage.progress ? 'completed' : ''}`}
                    >
                      <span className="progress-number">{stage.id}</span>
                    </div>
                  ))}
                  <div 
                    className="progress-line" 
                    style={{ width: `${getProgressPercentage(booking.bookingStatus)}%` }}
                  ></div>
                </div>
                <div className="stage-name">
                  {getCurrentStageName(booking.bookingStatus)}
                </div>
              </div>
              
              {booking.notes && (
                <div className="notes-preview">
                  <span className="icon">📝</span>
                  {booking.notes.length > 50 
                    ? `${booking.notes.substring(0, 50)}...` 
                    : booking.notes}
                </div>              )}
            </div>
          ))
        )}
        </div>
        
        {selectedBooking && (
          <div className="booking-details-panel">
            <div className="info-header">
              <h4>{selectedBooking.fullName || 'Customer'}</h4>
              <span className="status-badge">{selectedBooking.bookingStatus}</span>
            </div>
            
            <div className="info-item">
              <span className="label">
                <span className="icon">📅</span>
                Event Date:
              </span>
              <span className="value">{formatDate(selectedBooking.eventDate)}</span>
            </div>
            
            <div className="info-item">
              <span className="label">
                <span className="icon">📦</span>
                Package:
              </span>
              <span className="value">{selectedBooking.packageName || 'Not specified'}</span>
            </div>
            
            <div className="stage-control-section">
              <h3 className="section-title">Progress Stage</h3>
              <div className="status-card">
                <label className="control-label">Current Stage: <span className="stage-value">{stages[selectedStage].name}</span></label>
                
                <div className="slider-container">
                  <div className="slider-track">
                    {stages.map((stage, index) => (
                      <div 
                        key={stage.id} 
                        className={`slider-point ${selectedStage >= index ? 'active' : ''}`}
                        onClick={() => handleStageChange(index)}
                      >
                        <span className="slider-number">{stage.id}</span>
                        <span className="slider-label">{stage.name}</span>
                      </div>
                    ))}
                    <div className="slider-progress" style={{ width: `${stages[selectedStage].progress}%` }}></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={stages.length - 1}
                    step="1"
                    value={selectedStage}
                    onChange={handleSliderChange}
                    className="stage-slider"
                  />
                </div>
              </div>
            </div>
            
            <div className="notes-section">
              <h3 className="section-title">Customer Notes</h3>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Add a comment about the booking progress..."
                className="comment-textarea"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="savebtn" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancelbtn" 
                onClick={() => setSelectedBooking(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusChanger;