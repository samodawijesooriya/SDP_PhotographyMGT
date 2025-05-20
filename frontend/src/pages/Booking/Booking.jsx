// Booking.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { jwtDecode } from 'jwt-decode';
import { assets } from '../../assets/assets';

const Booking = ({setShowLogin}) => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [packages, setPackages] = useState([]);
  
  const [existingBookings, setExistingBookings] = useState([]);
  const [dateError, setDateError] = useState('');
  const [showDateError, setShowDateError] = useState(false);
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [eventImage, setEventImage] = useState('');

  const location = useLocation();
  
  // Add validation error state
  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    billingMobile: ''
  });

  // Initialize formData with all necessary fields
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

  const validateForm = () => {
    let isValid = true;
    const errors = {
      fullName: '',
      billingMobile: ''
    };

    // Name validation - only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.fullName)) {
      errors.fullName = 'Full Name can only contain letters and spaces.';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      isValid = false;
    }

    // Mobile validation (allow common formats)
    const cleaned = formData.billingMobile.replace(/\D/g, ''); // remove non-digit characters
    if (cleaned.length !== 10) {
      errors.billingMobile = 'Mobile number must contain exactly 10 digits.';
      isValid = false;
    }

    // Update validation errors state
    setValidationErrors(errors);
    
    return isValid;
  }
  
  // Validate individual field on blur
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'fullName') {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(value)) {
        error = 'Full Name can only contain letters and spaces.';
      }
    } 
    else if (name === 'billingMobile') {
      const cleaned = formData.billingMobile.replace(/\D/g, ''); 
      if (cleaned.length !== 10) {
        error = 'Mobile number must contain exactly 10 digits.';
      }

      const mobileRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{4,6}$/;
      if (!mobileRegex.test(value)) {
        error = 'Please enter a valid mobile number.';
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === '';
  }

  const getEventImagePath = (eventName) => {
    if (!eventName) return '';
  
    // Convert event name to a format suitable for filenames
    // Remove spaces, convert to lowercase
    const formattedName = eventName.toLowerCase().replace(/\s+/g, '-');
    console.log('Formatted event name:', formattedName);
  
    // Return the path to the image (you may need to adjust this based on your actual file structure)
    return `../assets/eventImages/${formattedName}.jpg`;
  };  
  
   // Function to check if user is logged in - ADDED IMPLEMENTATION
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify the token is valid
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true);
        } else {
          // Token expired
          setIsLoggedIn(false);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  // function to fetch user data from the database
  const fetchUserData = async (userId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('User data:', response.data);
      
      // Update form data with user information
      if (response.data) {
        setFormData(prevData => ({
          ...prevData,
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          billingMobile: response.data.billingMobile || '',
          billingAddress: response.data.billingAddress || ''
        }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  }

  // Fetch existing bookings for date validation
  const fetchExistingBookings = async () => {
    try {
      const response = await axios.get(`${url}/api/bookings/dates`);
      setExistingBookings(response.data);
    } catch (error) {
      console.error('Error fetching booking dates:', error);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    console.log('User data from localStorage:', userDataString);
    
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        fetchUserData(userData.id);
    }
    
    checkLoginStatus();
    fetchPackages();
    fetchExistingBookings();
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);
    
    // Clean up event listener
    return () => {
        window.removeEventListener('storage', checkLoginStatus);
    };
  }, [url]); // Added url as dependency

  // Effect to ensure body scrolling is enabled when component mounts/unmounts
  useEffect(() => {
    // Enable scrolling when component mounts
    document.body.style.overflow = 'auto';
    
    // Cleanup function to ensure scrolling is enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Helper function to check if a date is in the past or today
  const isPastOrToday = (dateString) => {
    if (!dateString) return false;
    
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

      setEventImage(getEventImagePath(selected.eventName));
    } else {
      setSelectedPackage(null);
      setEventImage('');
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
      const packageArray = Object.entries(response.data).map(([key, pkg]) => ({
        key,
        ...pkg
      }));
      setPackages(packageArray);
      return packageArray;
    } catch (error) {
      console.error('Error fetching packages:', error);
      return [];
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
    
    // Clear validation error when field is being edited
    if (name === 'fullName' || name === 'billingMobile') {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
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
  const calculateTotal = (bookingStatus) => {
    let basePrice = 0;
    // This is a placeholder function - implement your actual pricing logic
    if(selectedPackage){
      if(bookingStatus === 'Pending') {
        basePrice = 20000; 
      }
      else if(bookingStatus === 'Confirmed') {
        basePrice = selectedPackage.investedAmount; // Full payment
      } else {
        basePrice = selectedPackage.investedAmount; // Default to full payment
      } 
    }
    return basePrice.toString();
  };
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const packageData = await fetchPackages();
      setIsLoading(false);
      
      // Now that packages are loaded, check if we have a package in location state
      if (location.state && location.state.packageData) {
        const selectedPkg = location.state.packageData;
        console.log("Selected package from location:", selectedPkg);
        
        // Find the corresponding package in the packages array
        const matchedPackage = packageData.find(pkg => 
          pkg.packageId === selectedPkg.packageId || 
          pkg.packageId === selectedPkg.id
        );
        
        if (matchedPackage) {
          console.log("Found matching package:", matchedPackage);
          setFormData(prevData => ({
            ...prevData,
            packageName: matchedPackage.key,
            packageId: matchedPackage.packageId,
            eventType: matchedPackage.eventName || selectedPkg.eventName || '',
            coverageHours: matchedPackage.coverageHours || selectedPkg.coverageHours || ''
          }));
          
          // Set selectedPackage directly to ensure it's displayed
          setSelectedPackage(matchedPackage);
        } else {
          console.log("No matching package found in loaded packages");
        }
      }
    };
    
    loadData();
  }, [url, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      // Don't submit if validation fails
      return;
    }

    // Validate date availability
    // Check if date is selected
    if (!formData.eventDate) {
      alert('Please select an event date.');
      return;
    }
    
    // Check if selected date is in the past
    if (isPastOrToday(formData.eventDate)) {
      alert('Please select a future date. Past dates are not available for booking.');
      return;
    }
    
    // Check if the date is already booked
    if (!isDateAvailable) {
      alert('This date is already booked. Please select a different date.');
      return;
    }
    
    try {
      // Handle bookings with payment
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

  return (
    <div className='booking-container2'>
      <div className="booking-container">
        <div className="header-section">
          <h1 className="booking-title">Bookings</h1>
          <div className="title-underline"></div>
        </div>
        
        {isLoggedIn ? (
          // Show booking form if user is logged in
          <div className="single-page-form-container">
          {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your information...</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="booking-form">
              {/* Customer Details Section */}
              <div className="form-section">
                <h3 className="section-title">Customer Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name*</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your full name"
                      className={validationErrors.fullName ? 'error-input' : ''}
                      required
                    />
                    {validationErrors.fullName && (
                      <div className="error-message">{validationErrors.fullName}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile*</label>
                    <input
                      type="tel"
                      name="billingMobile"
                      value={formData.billingMobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your mobile number"
                      className={validationErrors.billingMobile ? 'error-input' : ''}
                      required
                    />
                    {validationErrors.billingMobile && (
                      <div className="error-message">{validationErrors.billingMobile}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Billing Address*</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      placeholder="Enter your billing address"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Package Selection Section */}
              <div className="form-section">
                <h3 className="section-title">Package Selection</h3>
                  
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
                          <div className="search-result-price">{pkg.investedAmount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchTerm && filteredPackages.length === 0 && (
                  <div className="no-results">No packages found matching "{searchTerm}"</div>
                )}
                
                <div className="form-group">
                  <label htmlFor='packageSelection'>Select Package*</label>
                  <select
                    id='packageSelection'
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleChange}
                    required>
                    <option value="">Choose a photography package</option>
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

                {/* Show package details if a package is selected */}
                {selectedPackage && (
                  <div className="package-details-container">
                    <div className="package-modal-content">
                    {eventImage && (
                        <div className="package-image-container">
                          <img 
                            src={assets[`${selectedPackage.eventName}`]}  
                            alt={`${selectedPackage.eventName}`} 
                            className="package-event-image"
                            style={{ width: '100%', height: '600px' }}
                          />
                        </div>
                      )}
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

              {/* Booking Options Section */}
              <div className="form-section">
                <h3 className="section-title">Booking Options</h3>                
                <div className="form-group">
                  <label>Booking Type*</label>
                  <select
                    name="bookingStatus"
                    value={formData.bookingStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Booking Type</option>
                    <option value="Pending">Pending Booking (Rs 20,000 deposit)</option>
                    <option value="Confirmed">Confirm Booking (100%)</option>
                  </select>
                </div>
                  {/* Event Details */}
                <div className="event-details-container">
                  <h4>Event Details</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Date*</label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        className={!isDateAvailable ? 'date-error' : ''}
                        required
                      />
                      {dateError && <div className="error-message">{dateError}</div>}
                    </div>
                  
                    <div className="form-group">
                      <label>Event Time*</label>
                      <input
                        type="time"
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Venue*</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="Enter event venue address"
                      required
                    />
                  </div>
                </div>
              </div>
                {/* Payment Section */}
              <div className="form-section">
                <h3 className="section-title">Payment Details</h3>
                
                <div className="form-group price-display">
                  <label>Total Amount</label>
                  <div className="price-box">LKR {calculateTotal(formData.bookingStatus)}</div>
                </div>
                
                <div className="form-group">
                  <label>Payment Method*</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="creditCard">Credit Card</option>
                    <option value="bankTransfer">Bank Transfer</option>
                  </select>
                </div>

                  {/* Credit Card Details - Conditional Rendering */}
                  {formData.paymentMethod === 'creditCard' && (
                    <div className="credit-card-details">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Card Number*</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="Enter card number"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Cardholder Name*</label>
                          <input
                            type="text"
                            name="cardholderName"
                            value={formData.cardholderName}
                            onChange={handleChange}
                            placeholder="Enter name on card"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date*</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            required
                          />
                        </div>

                        <div className="form-group cvv-group">
                          <label>CVV*</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="CVV"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Bank Transfer Details - Conditional Rendering */}
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
                        <label>Receipt Reference Number*</label>
                        <input
                          type="text"
                          name="bankReceiptRef"
                          value={formData.bankReceiptRef}
                          onChange={handleChange}
                          placeholder="Enter bank transfer reference number"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Upload Receipt Image*</label>
                        <input
                          type="file"
                          name="bankReceiptImage"
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            bankReceiptImage: e.target.files[0]  // Store the actual file object
                          })}
                          accept="image/*"
                          required
                        />
                      </div>
                    </div>                  
                    )}
                </div>
              
              {/* Additional Notes Section */}
              <div className="form-section">
                <h3 className="section-title">Additional Notes</h3>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional requirements or special requests"
                    rows="3"
                  ></textarea>
                </div>
              </div>                {/* Submit Button */}
              <div className="form-submit">
                <button type="submit" className="submit-btn">
                  Confirm & Process Payment
                </button>
              </div>
            </form>
          )}
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