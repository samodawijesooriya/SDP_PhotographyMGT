import React, { useState, useEffect, useContext } from 'react';
import './Packages.css';
import { X, Clock, Camera, Tag, DollarSign, Package as PackageIcon, Info } from 'lucide-react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { StoreContext } from '../../context/StoreContext';

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Parse items string from backend
const parseItems = (itemsString) => {
    if (!itemsString) return [];
    
    return itemsString.split(';').map(item => {
        const [name, quantity] = item.trim().split(':');
        return {
            name: name,
            quantity: quantity || 1
        };
    });
};

// Parse details string from backend
const parseDetails = (detailsString) => {
    if (!detailsString) return [];
    
    return detailsString.split(';').map(detail => detail.trim());
};

// Modal Component with Image
const PackageModal = ({ packageData, onClose }) => {
  if (!packageData) return null;
  
  // Get image for event type
  const getImageForEventType = (eventType) => {
    const imageMap = {
      'Wedding': 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'Birthday': 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'Graduation': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'Engagement': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      'Homecoming': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    };
    
    return imageMap[eventType] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };
  
  const navigate = useNavigate();

  const handleBooking = () => {
      navigate('/booking', { state: { packageData } });
      window.location.reload();
  };

  // Parse items and details if they're in string format
  const items = typeof packageData.items === 'string' 
      ? parseItems(packageData.items) 
      : packageData.items;
      
  const details = typeof packageData.details === 'string'
      ? parseDetails(packageData.details)
      : packageData.details;
  
  // Get price from investedAmount or price field
  const price = packageData.investedAmount 
      ? parseFloat(packageData.investedAmount) 
      : packageData.price;
  
  // Get package name and tier
  const packageName = packageData.packageName || packageData.name;
  const packageTier = packageData.packageTierName || packageData.tier;

  return (
      <div className="package-modal-overlay">
          <div className="package-modal">
              <button className="modal-close-btn" onClick={onClose}>
                  <X size={24} />
              </button>
              
              <div className="modal-header">
                  <div className="modal-image-container">
                      <img 
                          src={getImageForEventType(packageData.eventName)} 
                          alt={packageName} 
                          className="modal-image" 
                      />
                      <div className="modal-image-overlay"></div>
                  </div>
                  <div className="modal-header-content">
                      <h2>{packageName}</h2>
                      <div className="modal-tier">{packageTier}</div>
                  </div>
              </div>
              
              <div className="modal-content">
                  <div className="modal-main-details">
                      <div className="modal-detail-item">
                          <Clock className="modal-icon" />
                          <div>
                              <span className="modal-label">Coverage Hours</span>
                              <span className="modal-value">{packageData.coverageHours}</span>
                          </div>
                      </div>
                      
                      <div className="modal-detail-item">
                          <Camera className="modal-icon" />
                          <div>
                              <span className="modal-label">Event Type</span>
                              <span className="modal-value">{packageData.eventName}</span>
                          </div>
                      </div>
                      
                      <div className="modal-detail-item">
                          <Tag className="modal-icon" />
                          <div>
                              <span className="modal-label">Package Tier</span>
                              <span className="modal-value">{packageTier}</span>
                          </div>
                      </div>
                      
                      <div className="modal-detail-item investment">
                          <DollarSign className="modal-icon" />
                          <div>
                              <span className="modal-label">Investment</span>
                              <span className="modal-value">{formatCurrency(price)}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="modal-items">
                      <h3><PackageIcon className="small-icon" /> Package Items</h3>
                      <ul>
                          {items.map((item, index) => (
                              <li key={index}>
                                  {item.name}: <span className="item-quantity">{item.quantity}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
                  
                  <div className="modal-details">
                      <h3><Info className="small-icon" /> Package Details</h3>
                      <ul>
                          {details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                          ))}
                      </ul>
                  </div>
              </div>
              
              <button className="book-package-btn" onClick={handleBooking}>Book This Package</button>
          </div>
      </div>
  );
};

// Package Card Component
const PackageCard = ({ packageData, onClick }) => {
  // Default image URLs for different event types
  const getImageForEventType = (eventType) => {
    const imageMap = {
      'Wedding': assets.image01,
      'Birthday': assets.image03,
      'Graduation': assets.image05,
      'Engagement': assets.image09,
      'Homecoming': assets.image04,
    };
    
    return imageMap[eventType] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
  };

  // Get price from investedAmount or price field
  const price = packageData.investedAmount 
      ? parseFloat(packageData.investedAmount) 
      : packageData.price;
  
  // Get package name and tier
  const packageName = packageData.packageName || packageData.name;
  const packageTier = packageData.packageTierName || packageData.tier;

  return (
    <div className="package-card" onClick={onClick}>
      <div className="package-image-container">
        <img 
          src={getImageForEventType(packageData.eventName)} 
          alt={packageName} 
          className="package-image"
        />
        <div className="package-tier-badge">{packageTier}</div>
      </div>
      <div className="package-card-content">
        <h3 className="package-name">{packageName}</h3>
        <div className="package-price">
          <span>{formatCurrency(price)}</span>
        </div>
      </div>
      <div className="view-details">View Details</div>
    </div>
  );
};

// Main Packages Component
const Packages = () => {
    const { url } = useContext(StoreContext);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Fetch packages data from backend
    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${url}/api/packages`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch packages: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform backend data to match frontend structure if needed
            const transformedData = data.map(pkg => ({
                ...pkg,
                id: pkg.packageId,
                name: pkg.packageName,
                tier: pkg.packageTierName,
                price: parseFloat(pkg.investedAmount || 0),
                // Parse items and details only if needed in the listing view
            }));
            
            setPackages(transformedData);
            setError(null);
            console.log('Fetched packages:', transformedData);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to fetch packages. Please try again.');
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [url]);

    // Get unique event types for organizing packages
    const eventTypes = [...new Set(packages.map(pkg => pkg.eventName))];

    // Modal handlers
    const openModal = (pkg) => {
        setSelectedPackage(pkg);
        setShowModal(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    };

    const closeModal = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    if (loading) {
        return <div className="packages-loading">Loading packages...</div>;
    }

    if (error && packages.length === 0) {
        return <div className="packages-error">{error}</div>;
    }

    return (
        <div className="packages-content">
            <div className="packages-container">
                <h1 className="packages-title">Photography Packages</h1>
                <p className="packages-subtitle">Choose the perfect package for your special moments</p>
                
                {eventTypes.map(eventType => (
                    <div key={eventType} className="event-section">
                        <h2 className="event-title">{eventType}</h2>
                        <div className="event-divider"></div>
                        
                        <div className="event-packages">
                            {packages
                                .filter(pkg => pkg.eventName === eventType)
                                .map(pkg => (
                                    <PackageCard 
                                        key={pkg.id || pkg.packageId} 
                                        packageData={pkg} 
                                        onClick={() => openModal(pkg)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                ))}
                
                {showModal && selectedPackage && (
                    <PackageModal 
                        packageData={selectedPackage} 
                        onClose={closeModal} 
                    />
                )}
                
            </div>
            <Footer />
        </div>
    );
};

export default Packages;