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
  
  // Initialize formData with credit card fields and bank transfer fields
  const [formData, setFormData] = useState({
    // Customer Details
    name: '',
    email: '',
    mobile: '',
    billingAddress: '',
    
    // Event Details
    date: '',
    time: '',
    venue: '',
    
    // Package Details
    packageName: '',
    eventType: '',
    coverageHours: '',
    prenupAlbum: false,
    additionalImages: false,
    dayNight: false,
    
    // Payment Details
    totalAmount: '',
    bookingType: '',
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
    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    }
  };

  const prevTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const calculateTotal = () => {
    // This is a placeholder function - implement your actual pricing logic
    let basePrice = 0;
    
    // Set base price depending on package
    switch(formData.packageName) {
      case 'basic': basePrice = 1500; break;
      case 'standard': basePrice = 2500; break;
      case 'premium': basePrice = 3500; break;
      default: basePrice = 0;
    }
    
    // Add additional features
    if (formData.prenupAlbum) basePrice += 500;
    if (formData.additionalImages) basePrice += 300;
    if (formData.dayNight) basePrice += 800;
    
    return basePrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add the calculated total to form data
    const dataToSubmit = {
      ...formData,
      totalAmount: calculateTotal()
    };
    
    try {
      const response = await fetch('http://your-backend-url/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for authentication
        },
        body: JSON.stringify(dataToSubmit),
      });
      
      if (response.ok) {
        alert('Booking submitted successfully!');
        // Redirect to payment processing page
        navigate('/payment', { state: { bookingData: dataToSubmit } });
      } else {
        alert('Failed to submit booking. Please try again.');
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
                      name="name"
                      value={formData.name}
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
                      name="mobile"
                      value={formData.mobile}
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
                    <label>Event Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Event Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
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
                        <p><strong>Event Name:</strong> {selectedPackage.eventName}</p>
                        <p><strong>Package Tier:</strong> {selectedPackage.packageTier}</p>

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
                    <div className="price-box">${calculateTotal()}</div>
                  </div>
                  
                  <div className="form-group">
                    <label>Booking Type</label>
                    <select
                      name="bookingType"
                      value={formData.bookingType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Booking Type</option>
                      <option value="pencil">Pencil Booking (No deposit)</option>
                      <option value="half">Pending Booking (Rs 20,000 deposit)</option>
                      <option value="full">Confim Booking (100%)</option>
                    </select>
                  </div>
                  
                  {/* Only show payment method if booking type is NOT pencil */}
                  {formData.bookingType && formData.bookingType !== 'pencil' && (
                    <>
                      <div className="form-group">
                        <label>Payment Method</label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          required={formData.bookingType !== 'pencil'}
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
                              required={formData.bookingType !== 'pencil' && formData.paymentMethod === 'creditCard'}
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
                              required={formData.bookingType !== 'pencil' && formData.paymentMethod === 'creditCard'}
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
                              required={formData.bookingType !== 'pencil' && formData.paymentMethod === 'creditCard'}
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
                              required={formData.bookingType !== 'pencil' && formData.paymentMethod === 'creditCard'}
                            />
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Details - Conditional Rendering */}
                      {formData.paymentMethod === 'bankTransfer' && (
                        <div className="bank-transfer-details">
                          <div className="form-group">
                            <label>Receipt Reference Number</label>
                            <input
                              type="text"
                              name="bankReceiptRef"
                              value={formData.bankReceiptRef}
                              onChange={handleChange}
                              placeholder="Reference Number"
                              required={formData.bookingType !== 'pencil' && formData.paymentMethod === 'bankTransfer'}
                            />
                          </div>

                          <div className="form-group">
                            <label>Upload Receipt Image</label>
                            <input
                              type="file"
                              name="bankReceiptImage"
                              onChange={(e) => setFormData({ ...formData, bankReceiptImage: e.target.files[0] })}
                              accept="image/*"
                            />
                          </div>
                          <div className="form-group">
                            <label>Notes for Bank Transfer</label>
                            <textarea
                              name="bankTransferNotes"
                              value={formData.bankTransferNotes || ''}
                              onChange={handleChange}
                              placeholder="Add any notes regarding the bank transfer"
                              rows="3"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show message explaining no payment for pencil booking */}
                  {formData.bookingType === 'pencil' && (
                    <div className="pencil-booking-message">
                      <p>No payment is required for Pencil Booking. This booking will be held temporarily without a deposit.</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Tab 5: Review & Submit */}
              {activeTab === 4 && (
                <div className="tab-content">
                  <h3>Review & Submit</h3>
                  
                  <div className="review-section">
                    <h4>Customer Details</h4>
                    <div className="review-item"><strong>Name:</strong> {formData.name}</div>
                    <div className="review-item"><strong>Email:</strong> {formData.email}</div>
                    <div className="review-item"><strong>Mobile:</strong> {formData.mobile}</div>
                    <div className="review-item"><strong>Billing Address:</strong> {formData.billingAddress}</div>
                  </div>
                  
                  <div className="review-section">
                    <h4>Event Details</h4>
                    <div className="review-item"><strong>Date:</strong> {formData.date}</div>
                    <div className="review-item"><strong>Time:</strong> {formData.time}</div>
                    <div className="review-item"><strong>Venue:</strong> {formData.venue}</div>
                  </div>
                  
                  <div className="review-section">
                    <h4>Package Details</h4>
                    <div className="review-item"><strong>Package:</strong> {selectedPackage ? selectedPackage.packageName : ''}</div>
                    <div className="review-item"><strong>Event Type:</strong> {selectedPackage ? selectedPackage.eventName : formData.eventType}</div>
                    <div className="review-item"><strong>Coverage Hours:</strong> {selectedPackage ? selectedPackage.coverageHours : formData.coverageHours}</div>
                    <div className="review-item">
                      <strong>Additional Features:</strong>
                      <ul>
                        {formData.prenupAlbum && <li>Prenup Album (+$500)</li>}
                        {formData.additionalImages && <li>Additional 1000 Images (+$300)</li>}
                        {formData.dayNight && <li>Day & Night Coverage (+$800)</li>}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="review-section">
                    <h4>Payment Details</h4>
                    <div className="review-item"><strong>Total Amount:</strong> ${calculateTotal()}</div>
                    <div className="review-item"><strong>Booking Type:</strong> {formData.bookingType}</div>
                    <div className="review-item"><strong>Payment Method:</strong> {formData.paymentMethod}</div>
                  </div>
                  
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional requirements or notes"
                      rows="3"
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
                    Confirm & Proceed to Payment
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