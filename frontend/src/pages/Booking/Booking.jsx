// Booking.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Booking.css';
import Footer from '../../components/Footer/Footer';

const Booking = ({setShowLogin}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    event: '',
    venue: '',
    package: '',
    prenupAlbum: false,
    additionalImages: false,
    dayNight: false,
    date: '',
    notes: ''
  });

  useEffect(() => {

    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); // Convert to boolean
    };

    checkLoginStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://your-backend-url/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Booking submitted successfully!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          mobile: '',
          event: '',
          venue: '',
          package: '',
          prenupAlbum: false,
          additionalImages: false,
          dayNight: false,
          date: '',
          notes: ''
        });
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

  return (
    <div className='booking-container2'>
      <div className="booking-container">
        <div className="header-section">
          <h1 className="booking-title">Bookings</h1>
          <div className="title-underline"></div>
        </div>
        
        {isLoggedIn ? (
          // Show booking form if user is logged in
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
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
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <select
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose Event Type</option>
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Venue"
                />
              </div>
            </div>

            <div className="form-group">
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
                required
              >
                <option value="">Package Selection</option>
                <option value="basic">Basic Package</option>
                <option value="standard">Standard Package</option>
                <option value="premium">Premium Package</option>
              </select>
            </div>

            <div className="form-group additional-features">
              <label>Additional Features</label>
              <div className="checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="prenupAlbum"
                    checked={formData.prenupAlbum}
                    onChange={handleChange}
                  />
                  Prenup Album
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="additionalImages"
                    checked={formData.additionalImages}
                    onChange={handleChange}
                  />
                  Additional 1000 Images
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="dayNight"
                    checked={formData.dayNight}
                    onChange={handleChange}
                  />
                  Day & Night
                </label>
                <span className="more">More +</span>
              </div>
            </div>

            <div className="form-group">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional Notes"
                rows="4"
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Book Now!
            </button>
          </form>
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