import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/booking');
  };

  const handleViewPackages = () => {
    navigate('/packages');
  };

  return (
    <div className='header'>
      <div className='header-content'>
        <h1 className='header-text'>
          A revolutionary medium for an artistic eye and a pure mind
        </h1>
        <div className="header-buttons">
          <button 
            className="header-btn book-now"
            onClick={handleBookNow}
          >
            Book Now
          </button>
          <button 
            className="header-btn view-packages"
            onClick={handleViewPackages}
          >
            View Packages
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header