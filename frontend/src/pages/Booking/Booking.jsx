// Booking.jsx
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Booking.css';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

// The PACKAGE_DETAILS object will be replaced with data from the backend

const Booking = ({setShowLogin}) => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [packages, setPackages] = useState([]);
  
  let PACKAGE_ARRAY = [];

  const [existingBookings, setExistingBookings] = useState([]);
  const [dateError, setDateError] = useState('');
  const [showDateError, setShowDateError] = useState(false);
  const [isDateAvailable, setIsDateAvailable] = useState(true);

  // Initialize formData with credit card fields and bank transfer fields
  const [formData, setFormData] = useState({
    // Customer Details
    fullName: '',
    email: '',
    billingMobile: '',
    billingAddress: '',
    
    // Event Details
    eventDate: '',
    eventTime: '',
    venue: '',
    
    // Package Details
    packageId: '',
    packageName: '',
    eventType: '',
    coverageHours: '',
    
    // Payment Details
    totalAmount: '',
    bookingStatus: '',
    paymentMethod: '',
    
    // Credit Card Details
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    
    // Bank Transfer Details
    bankReceiptRef: '',
    bankReceiptImage: null,
    
    // Additional Notes
    notes: ''
  });

  // Fetch existing bookings for date validation
  const fetchExistingBookings = async () => {
    try {
      const response = await axios.get(`${url}/api/bookings/dates`);
      setExistingBookings(response.data);
    } catch (error) {
      console.error('Error fetching booking dates:', error);
    }
  };

  // Call this function when component mounts
  useEffect(() => {
    fetchPackages();
    fetchExistingBookings(); // Add this new function call
  }, []); 

  // Helper function to check if a date is in the past or today
  const isPastOrToday = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  };

  // Check if a date is already booked
  const checkDateAvailability = (date) => {
    // Return true if date is available, false if it's booked
    if (!date) return true; // No date selected yet
    
    // Convert date string to Date object for comparison
    const selectedDate = new Date(date);
    
    // Reset the time part to compare dates only
    selectedDate.setHours(0, 0, 0, 0);
    
    // Check if the date is in the past or today
    if (isPastOrToday(date)) {
      return false;
    }
    
    // Check if the date exists in our bookings
    const isBooked = existingBookings.some(booking => {
      const bookingDate = new Date(booking.eventDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === selectedDate.getTime();
    });
    
    return !isBooked;
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); // Convert to boolean
    };

    checkLoginStatus();
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Update selectedPackage when packageName changes
  useEffect(() => {
    if (formData.packageName && packages.length > 0) {
      const selected = packages.find(pkg => pkg.key === formData.packageName);
      setSelectedPackage(selected);
      
      // Also update related form fields
      if (selected) {
        setFormData(prevData => ({
          ...prevData,
          packageId: selected.packageId,  // Add packageId
          coverageHours: selected.coverageHours || '',
          eventType: selected.eventName || ''
        }));
      }
    } else {
      setSelectedPackage(null);
    }
  }, [formData.packageName, packages]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchedPackages = packages.filter(pkg => {
        return pkg.packageName.toLowerCase().includes(term) || 
               pkg.eventName.toLowerCase().includes(term);
      }).map(pkg => ({
        key: pkg.key,
        ...pkg
      }));
      
      setFilteredPackages(matchedPackages);
    } else {
      setFilteredPackages([]);
    }
  }, [searchTerm]);

  const fetchPackages = async () => {
    try {
    const response = await axios.get(`${url}/api/packages`);
    // Turn the object into an array
    PACKAGE_ARRAY = Object.entries(response.data).map(([key, pkg]) => ({
      key,
      ...pkg
    }));
    setPackages(PACKAGE_ARRAY);
    } catch (error) {
    console.error('Error fetching packages:', error);
    }
  }; 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for event date to check availability
    if (name === 'eventDate') {
      if (value) {
        // First check if it's a past date
        if (isPastOrToday(value)) {
          setIsDateAvailable(false);
          setDateError('Please select a future date. Past dates are not available for booking.');
          setShowDateError(true);
        } else {
          // Then check if the date is already booked
          const isAvailable = checkDateAvailability(value);
          setIsDateAvailable(isAvailable);
          
          if (!isAvailable) {
            setDateError('This date is already booked. Please select a different date.');
            setShowDateError(true);
          } else {
            setDateError('');
            setShowDateError(false);
          }
        }
      } else {
        // No date selected
        setIsDateAvailable(true);
        setDateError('');
        setShowDateError(false);
      }
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const selectPackageFromSearch = (packageKey) => {
    // Set the package in the dropdown
    setFormData(prevData => ({
      ...prevData,
      packageName: packageKey
    }));
    
    // Clear the search
    setSearchTerm('');
  };
  const nextTab = () => {
    // If we're on the Event Details tab (tab 1) and moving forward
    if (activeTab === 1) {
      // Only for non-Pencil bookings that require dates
      if (formData.bookingStatus !== 'Pencil') {
        // Check if date is selected
        if (!formData.eventDate) {
          alert('Please select an event date.');
          return;
        }
        
        // Check if selected date is valid (not past or already booked)
        if (isPastOrToday(formData.eventDate)) {
          alert('Please select a future date. Past dates are not available for booking.');
          return;
        }
        
        // Check if date is available (not already booked)
        if (!isDateAvailable) {
          alert('This date is already booked. Please select an available date before proceeding.');
          return;
        }
      }
    }
    
    // Original next tab logic
    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    }
  };


  const prevTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const calculateTotal = (bookingStatus) => {
    let basePrice = 0;
    // This is a placeholder function - implement your actual pricing logic
    if(selectedPackage){
      if(bookingStatus === 'Pencil') {
        basePrice = 0; // No payment for Pencil booking
      } else if(bookingStatus === 'Pending') {
        basePrice = selectedPackage.investedAmount / 2; // 50% deposit
      }
      else if(bookingStatus === 'Confirm') {
        basePrice = selectedPackage.investedAmount; // Full payment
      } else {
        basePrice = selectedPackage.investedAmount; // Default to full payment
      } 
    }
    return basePrice.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For non-Pencil bookings, validate date availability again
    if (formData.bookingStatus !== 'Pencil') {
      // Check if date is selected
      if (!formData.eventDate) {
        alert('Please select an event date.');
        setActiveTab(1); // Go back to the Event Details tab
        return;
      }
      
      // Check if selected date is in the past
      if (isPastOrToday(formData.eventDate)) {
        alert('Please select a future date. Past dates are not available for booking.');
        setActiveTab(1); // Go back to the Event Details tab
        return;
      }
      
      // Check if the date is already booked
      if (!isDateAvailable) {
        alert('This date is already booked. Please select a different date.');
        setActiveTab(1); // Go back to the Event Details tab
        return;
      }
    }
    
    try {
      if(formData.bookingStatus === 'Pencil') {
        // Prepare the data for pending booking
        const pendingBookingData = {
          fullName: formData.fullName,
          email: formData.email,
          billingMobile: formData.billingMobile,
          billingAddress: formData.billingAddress,
          packageId: formData.packageId,
          packageName: formData.packageName,
          bookingStatus: formData.bookingStatus,
          notes: formData.notes
        };
          const response = await fetch(`${url}/api/bookings/createPending`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for authentication
          },
          body: JSON.stringify(pendingBookingData),
        });
        
        if (response.ok) {
          console.log('Pencil booking submitted successfully!');
          navigate('/booking-success', { state: { bookingData: pendingBookingData } });
        } else {
          alert('Failed to submit pencil booking. Please try again.');
        }
      } else {
        // Handle regular bookings with payment\
        // Create FormData object instead of JSON
        const formDataToSubmit = new FormData();
        
        const totalAmount = calculateTotal(formData.bookingStatus);

        // Add all the form fields to the FormData
        Object.keys(formData).forEach(key => {
          // Skip bankReceiptImage as it's handled separately
          if (key !== 'bankReceiptImage') {
            formDataToSubmit.append(key, formData[key]);
          }
        });
        
        // Add the calculated total to form data
        formDataToSubmit.append('totalAmount', totalAmount);

          // Add the file if it exists
        if (formData.bankReceiptImage && formData.paymentMethod === 'bankTransfer') {
          formDataToSubmit.append('bankReceiptImage', formData.bankReceiptImage);
        }
        
        console.log('Data to submit:', Object.fromEntries(formDataToSubmit));
        // Update the fetch call to not set Content-Type header (browser will set it with boundary)
        const response = await fetch(`${url}/api/bookings/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Keep only the auth header
          },
          body: formDataToSubmit, // Send the FormData object directly
        });
        
        if (response.ok) {
          console.log('Booking submitted successfully!');
          // Redirect to payment processing page
          navigate('/payment-success', { state: { bookingData: Object.fromEntries(formDataToSubmit) } });
        } else {
          alert('Failed to submit booking. Please try again.');
          console.error('Error response:', await response.json());
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const LoginNotification = () => (
    <div className="login-notification">
      <h2>Please Sign In to make a booking</h2>
      <p>You need to be logged in to access the booking form.</p>
      <button 
        className="login-button" 
        onClick={() => setShowLogin(true)}
      >
        Sign In
      </button>
    </div>
  );

  const tabTitles = [
    "1. Customer Details",
    "2. Event Details",
    "3. Package Details",
    "4. Payment",
    "5. Review & Submit"
  ];

  useEffect(() => {
          fetchPackages();
      }, []);


  return (
    <div className='booking-container2'>
      <div className="booking-container">
        <div className="header-section">
          <h1 className="booking-title">Bookings</h1>
          <div className="title-underline"></div>
        </div>
        
        {isLoggedIn ? (
          // Show booking form if user is logged in
          <div className="tabbed-form-container">
            <div className="tab-navigation">
              {tabTitles.map((title, index) => (
                <div 
                  key={index}
                  className={`tab-item ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {title}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Tab 1: Customer Details */}
              {activeTab === 0 && (
                <div className="tab-content">
                  <h3>Customer Details</h3>
                  
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mobile</label>
                    <input
                      type="tel"
                      name="billingMobile"
                      value={formData.billingMobile}
                      onChange={handleChange}
                      placeholder="Mobile"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Billing Address</label>
                    <textarea
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      placeholder="Billing Address"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                </div>
              )}
              
              {/* Tab 2: Event Details */}
              {activeTab === 1 && (
                <div className="tab-content">
                  <h3>Event Details</h3>

                  <div className="form-group">
                    <label>Booking Type</label>
                    <select
                      name="bookingStatus"
                      value={formData.bookingStatus}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Booking Type</option>
                      <option value="Pencil">Pencil Booking (No deposit)</option>
                      <option value="Pending">Pending Booking (Rs 20,000 deposit)</option>
                      <option value="Confirmed">Confim Booking (100%)</option>
                    </select>
                  </div>
                  
                  { formData.bookingStatus !== 'Pencil' && (
                    <>                    <div className="form-group">
                    <label>Event Date</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className={!isDateAvailable ? 'date-error' : ''}
                      required
                    />
                    <br/>
                    {dateError && <div className="error-message">{dateError}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label>Event Time</label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Venue</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="Venue Address"
                      required
                    />
                  </div>
                    </>
                  )}
                  {/* Show message explaining no payment for Pencil booking */}
                  {formData.bookingStatus === 'Pencil' && (
                    <div className="Pencil-booking-message">
                      <p>No Event Details Required.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tab 3: Package Details */}
              {activeTab === 2 && (
                <div className="tab-content">
                  <h3>Package Details</h3>
                  
                  {/* Package Search */}
                  <div className="form-group">
                    <label>Search Packages</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search by package name or event type..."
                      className="search-input"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchTerm && filteredPackages.length > 0 && (
                    <div className="search-results">
                      <h4>Available Packages</h4>
                      <div className="search-results-list">
                        {filteredPackages.map((pkg) => (
                          <div 
                            key={pkg.key} 
                            className="search-result-item"
                            onClick={() => selectPackageFromSearch(pkg.key)}
                          >
                            <div className="search-result-name">{pkg.packageName}</div>
                            <div className="search-result-event">Event: {pkg.eventName}</div>
                            <div className="search-result-price">₹{pkg.investedAmount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchTerm && filteredPackages.length === 0 && (
                    <div className="no-results">No packages found matching "{searchTerm}"</div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor='packageSelection'>Package Selection</label>
                    <select
                      id='packageSelection'
                      name="packageName"
                      value={formData.packageName}
                      onChange={handleChange}
                      required>
                        <option value="">Select Package</option>
                        {packages.map((pkg) => (
                          <option 
                            key={pkg.key} 
                            value={pkg.key}
                          >
                            {pkg.packageName}
                          </option>
                        ))}
                      </select>
                  </div>

                  {/* Only show package details if a package is selected */}
                  {selectedPackage && (
                    <div className="form-group">
                      <div className="package-modal-content">
                        <p><strong>Coverage Hours:</strong> {selectedPackage.coverageHours}</p>
                        <p><strong>Investment:</strong> LKR {selectedPackage.investedAmount}</p>
                        <p><strong>Package Items:</strong></p>
                        <ul>
                          {selectedPackage.items && selectedPackage.items.split(';').map((item, index) => (
                            <li key={index}>{item.trim()}</li>
                          ))}
                        </ul>

                        <p><strong>Package Details:</strong></p>
                        <ul>
                          {selectedPackage.details && selectedPackage.details.split(';').map((detail, index) => (
                            <li key={index}>{detail.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tab 4: Payment Details */}
              {activeTab === 3 && (
                <div className="tab-content">
                  <h3>Payment Details</h3>
                  
                  <div className="form-group price-display">
                    <label>Total Amount</label>
                    <div className="price-box"> LKR {calculateTotal(formData.bookingStatus)}</div>
                  </div>
                  
                  
                  
                  {/* Only show payment method if booking type is NOT Pencil */}
                  {formData.bookingStatus !== 'Pencil' && (
                    <>
                      <div className="form-group">
                        <label>Payment Method</label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          required={formData.bookingStatus !== 'Pencil'}
                        >
                          <option value="">Select Payment Method</option>
                          <option value="creditCard">Credit Card</option>
                          <option value="bankTransfer">Bank Transfer</option>
                        </select>
                      </div>

                      {/* Credit Card Details - Conditional Rendering */}
                      {formData.paymentMethod === 'creditCard' && (
                        <div className="credit-card-details">
                          <div className="form-group">
                            <label>Card Number</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              placeholder="Card Number"
                              required={formData.bookingStatus !== 'Pencil' && formData.paymentMethod === 'creditCard'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                              type="text"
                              name="cardholderName"
                              value={formData.cardholderName}
                              onChange={handleChange}
                              placeholder="Cardholder Name"
                              required={formData.bookingStatus !== 'Pencil' && formData.paymentMethod === 'creditCard'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              required={formData.bookingStatus !== 'Pencil' && formData.paymentMethod === 'creditCard'}
                            />
                          </div>

                          <div className="form-group">
                            <label>CVV</label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="CVV"
                              required={formData.bookingStatus !== 'Pencil' && formData.paymentMethod === 'creditCard'}
                            />
                          </div>
                        </div>
                      )}                      {/* Bank Transfer Details - Conditional Rendering */}
                      {formData.paymentMethod === 'bankTransfer' && (
                        <div className="bank-transfer-details">
                          <div className="bank-account-info">
                            <h4>Bank Account Details</h4>
                            <div className="bank-info-container">
                              <p><strong>Account Name:</strong> Pathum L Weerasighe Photography</p>
                              <p><strong>Bank Name:</strong> Bank of Ceylon</p>
                              <p><strong>Account Number:</strong> 85471234</p>
                              <p><strong>Branch:</strong> Kegalle Branch</p>
                              <p className="bank-transfer-note">Please make the payment and upload the receipt below. Include your name or booking date as reference.</p>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Receipt Reference Number</label>
                            <input
                              type="text"
                              name="bankReceiptRef"
                              value={formData.bankReceiptRef}
                              onChange={handleChange}
                              placeholder="Reference Number"
                              required={formData.bookingStatus !== 'Pencil' && formData.paymentMethod === 'bankTransfer'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Upload Receipt Image</label>
                            <input
                              type="file"
                              name="bankReceiptImage"
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                bankReceiptImage: e.target.files[0]  // Store the actual file object
                              })}
                              accept="image/*"
                            />
                          </div>
                          
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show message explaining no payment for Pencil booking */}
                  {formData.bookingStatus === 'Pencil' && (
                    <div className="Pencil-booking-message">
                      <p>No payment is required for Pencil Booking. This booking will be held temporarily without a deposit.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tab 5: Review & Submit */}
              {activeTab === 4 && (
                <div className="tab-content">
                  <h3>Review & Submit</h3>
                  
                  <div className="review-container">
                    <div className="review-section">
                      <h4>Customer Details</h4>
                      <div className="review-item"><strong>Name:</strong> {formData.fullName}</div>
                      <div className="review-item"><strong>Email:</strong> {formData.email}</div>
                      <div className="review-item"><strong>Mobile:</strong> {formData.billingMobile}</div>
                      <div className="review-item"><strong>Billing Address:</strong> {formData.billingAddress}</div>
                    </div>
                    
                    <hr className="review-divider" />
                    {formData.bookingStatus !== 'Pencil' && (
                      <>
                      <div className="review-section">
                      <h4>Event Details</h4>
                      <div className="review-item"><strong>Date:</strong> {formData.eventDate}</div>
                      <div className="review-item"><strong>Time:</strong> {formData.eventTime}</div>
                      <div className="review-item"><strong>Venue:</strong> {formData.venue}</div>
                      </div>
                    
                      <hr className="review-divider" />
                      </>
                    )}
                    
                    <div className="review-section">
                      <h4>Package Details</h4>
                      <div className="review-item"><strong>Package:</strong> {selectedPackage ? selectedPackage.packageName : ''}</div>
                      <div className="review-item"><strong>Event Type:</strong> {selectedPackage ? selectedPackage.eventName : formData.eventType}</div>
                      <div className="review-item"><strong>Coverage Hours:</strong> {selectedPackage ? selectedPackage.coverageHours : formData.coverageHours}</div>
                    </div>
                    
                    <hr className="review-divider" />
                    
                    <div className="review-section">
                      <h4>Payment Details</h4>
                      <div className="review-item"><strong>Total Amount:</strong> LKR {calculateTotal(formData.bookingStatus)}</div>
                      
                      {formData.bookingStatus === 'Pencil' && (
                        <>
                          <div className="review-item"><strong>Payment Amount:</strong> No Payment</div>
                        </>
                      )}
                      
                      {formData.bookingStatus === 'Pending' && (
                        <>
                          <div className="review-item"><strong>Payment Amount:</strong> LKR 20,000</div>
                          <div className="review-item"><strong>Balance:</strong> LKR {calculateTotal(formData.bookingStatus) - 20000}</div>
                        </>
                      )}
                      
                      {formData.bookingStatus === 'Confirmed' && (
                        <div className="review-item"><strong>Payment Amount:</strong> LKR {calculateTotal(formData.bookingStatus)} (Full Payment)</div>
                      )}
                      
                      <div className="review-item"><strong>Booking Type:</strong> {
                        formData.bookingStatus === 'Pencil' ? 'Pencil Booking (No deposit)' :
                        formData.bookingStatus === 'Pending' ? 'Pending Booking (Rs 20,000 deposit)' :
                        formData.bookingStatus === 'Confirmed' ? 'Confirm Booking (100%)' : ''
                      }</div>
                      <div className="review-item"><strong>Payment Method:</strong> {
                        formData.paymentMethod === 'creditCard' ? 'Credit Card' :
                        formData.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'None'
                      }</div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional requirements or notes"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              )}
              
              <div className="tab-navigation-buttons">
                {activeTab > 0 && (
                  <button type="button" className="prev-btn" onClick={prevTab}>
                    Previous
                  </button>
                )}
                
                {activeTab < 4 && (
                  <button type="button" className="next-btn" onClick={nextTab}>
                    Next
                  </button>
                )}
                
                {activeTab === 4 && (
                  <button type="submit" className="submit-btn">
                    {formData.bookingStatus === 'Pencil' ? 'Confirm Pencil Booking' : 'Confirm & Proceed to Payment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          // Show login notification if user is not logged in
          <LoginNotification />
        )}
      </div>
      <Footer />
    </div>  
  );
};

export default Booking;