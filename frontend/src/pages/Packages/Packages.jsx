import React, { useState, useEffect, useContext } from 'react';
import './Packages.css';
import { X, Clock, Camera, Tag, DollarSign, Package as PackageIcon, Info, Plus } from 'lucide-react';
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
    
    return itemsString.split(';').map(itemStr => {
        let itemType, quantity;
        
        // Try to match the pattern "Item Type (quantity)"
        const match1 = itemStr.trim().match(/(.+?)\s*\((\d+)\)/);
        if (match1) {
            [, itemType, quantity] = match1;
        } else {
            // Try to match the pattern "Item Type:quantity"
            const match2 = itemStr.trim().match(/(.+?)\s*:\s*(\d+)/);
            if (match2) {
                [, itemType, quantity] = match2;
            } else {
                // Just take the whole string as item type with default quantity
                itemType = itemStr.trim();
                quantity = 1;
            }
        }
        
        return {
            itemType: itemType,
            quantity: parseInt(quantity) || 1
        };
    });
};

// Parse details string from backend
const parseDetails = (detailsString) => {
    if (!detailsString) return [];
    
    return detailsString.split(';').map(detail => detail.trim());
};

// Modal Component with Image
const PackageModal = ({ packageData, onClose, onCustomize }) => {
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
  };

  // Handle customize click
  const handleCustomizeClick = () => {
    onCustomize(packageData);
    onClose(); // Close the modal after clicking customize
  };

  // Parse items and details if they're in string format
  const items = Array.isArray(packageData.items) 
      ? packageData.items 
      : (typeof packageData.items === 'string' ? parseItems(packageData.items) : []);
      
  const details = Array.isArray(packageData.details)
      ? packageData.details
      : (typeof packageData.details === 'string' ? parseDetails(packageData.details) : []);
  
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
                      {items && items.length > 0 ? (
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>
                                    {item.itemType || item.name}: <span className="item-quantity">{item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                      ) : (
                        <p>No items specified in this package</p>
                      )}
                  </div>
                    <div className="modal-details">
                      <h3><Info className="small-icon" /> Package Details</h3>
                      {details && details.length > 0 ? (
                        <ul>
                            {details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>
                      ) : (
                        <p>No details specified in this package</p>
                      )}
                  </div>
              </div>
              
              <div className="modal-actions">
                  <button className="customize-package-btn" onClick={handleCustomizeClick}>
                      Customize
                  </button>
                  <button className="book-package-btn" onClick={handleBooking}>Book This Package</button>
              </div>
          </div>
      </div>
  );
};

// customize Package Modal
const CustomPackageModal = ({ eventType, existingPackage, onClose, onSubmit }) => {
  const { url, user } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [basePackage, setBasePackage] = useState(null);

  const [allItems, setAllItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [basePackageItems, setBasePackageItems] = useState([]);
  const [baseItemQuantities, setBaseItemQuantities] = useState({});

  const [allDetails, setAllDetails] = useState([]);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [basePackageDetails, setBasePackageDetails] = useState([]);
  const [baseDetailDescription, setBaseDetailDescription] = useState({});
  
  // Initialize with either existing package data or default values
  const [customPackage, setCustomPackage] = useState(() => {
    if (existingPackage) {
        const parsedItems = existingPackage.items ? 
        (Array.isArray(existingPackage.items) ? 
            [...existingPackage.items] : 
            parseItems(existingPackage.items)
        ) : [];
        
        const parsedDetails = existingPackage.details ?
        (Array.isArray(existingPackage.details) ? 
            [...existingPackage.details] : 
            parseDetails(existingPackage.details)
        ) : [];

        return {
            packageId: existingPackage.isCustom ? existingPackage.packageId : null, // Only keep ID if it's already a custom package
            packageName: `${existingPackage.name || existingPackage.packageName} (Custom)`,
            eventName: existingPackage.eventName,
            packageTierName: "Custom",
            coverageHours: existingPackage.coverageHours || 2,
            items: parsedItems,
            details: parsedDetails,
            investedAmount: existingPackage.price || existingPackage.investedAmount || 0,
            // Store reference to the original package ID
            originalPackageId: existingPackage.packageId || existingPackage.id
        };
    } else {
            // Default values for new custom package
            return {
            packageName: `Custom ${eventType} Package`,
            eventName: eventType,
            packageTierName: "Custom",
            coverageHours: 2,
            items: [],
            details: [],
            investedAmount: 0
        };
    }
  });
  
  // Fetch base package details for the event type
  useEffect(() => {
    const fetchBasePackage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/api/packages/base/${eventType}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch base package: ${response.status}`);
        }
        
        const data = await response.json();
        setBasePackage(data);

        // Parse the base package items
        const parsedBaseItems = data.items ? parseItems(data.items) : [];
        setBasePackageItems(parsedBaseItems);

        const baseQuantities = {};
        parsedBaseItems.forEach(item => {
            baseQuantities[item.itemType] = item.quantity;
        });
        setBaseItemQuantities(baseQuantities);        if (!existingPackage) {
          // For new custom packages, use the base package data
          setCustomPackage(prev => ({
            ...prev,
            coverageHours: data.coverageHours || 2,
            items: parsedBaseItems,
            details: data.details ? parseDetails(data.details) : [],
            investedAmount: data.investedAmount || 0,
          }));
        } else {
          // If we're customizing an existing package, don't change any data
          // but do recalculate the price based on current items and details
          setTimeout(() => {
            calculateTotalPrice(customPackage.items, customPackage.details);
          }, 0);
        }

        console.log("Base Package Data:", data);

        const itemsResponse = await fetch(`${url}/api/packages/pkg/items`);        if (!itemsResponse.ok) {
          throw new Error(`Failed to fetch items: ${itemsResponse.status}`);
        }
        const itemsData = await itemsResponse.json();
        setAllItems(itemsData);
        
        // Set default selected item if items exist
        if (itemsData.length > 0) {
          setSelectedItemId(itemsData[0].itemId);
        }

        // Parse the base package details
        const parsedBaseDetails = data.details ? parseDetails(data.details) : [];
        setBasePackageDetails(parsedBaseDetails);

        const baseDetailDescriptions = {};
        parsedBaseDetails.forEach(detail => {
            baseDetailDescriptions[detail] = true;
        });
        setBaseDetailDescription(baseDetailDescriptions);

        // Fetch package details
        const detailsResponse = await fetch(`${url}/api/packages/pkg/details`);
        if (!detailsResponse.ok) {
            throw new Error(`Failed to fetch details: ${detailsResponse.status}`);
        }
        const detailsData = await detailsResponse.json();
        setAllDetails(detailsData);
        
        // Set default selected detail if details exist
        if (detailsData.length > 0) {
            setSelectedDetailId(detailsData[0].detailId);
        }
        
        // Calculate total price with both items and details
        if (existingPackage) {
            setTimeout(() => calculateTotalPrice(customPackage.items, customPackage.details), 0);
        }
      } catch (error) {
        console.error('Error fetching base package:', error);
      } finally {
        setLoading(false);
      }    };
    
    fetchBasePackage();
        }, [eventType, url, existingPackage, customPackage.coverageHours]);
        
        // Handle form input changes
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setCustomPackage(prev => ({
            ...prev,
            [name]: value
        }));
  };
    // Handle coverage hours change and update price accordingly
  const handleHoursChange = (e) => {
     const hours = parseInt(e.target.value);

    setCustomPackage(prev => ({
        ...prev,
        coverageHours: hours
    }));
    
    // Recalculate price when hours change - include items and details
    setTimeout(() => {
      calculateTotalPrice(customPackage.items, customPackage.details);
    }, 0);
  };
  
  // Calculate total price based on hours and items
  const calculateTotalPrice = (items, details = customPackage.details) => {
    console.log("Calculating total price with items:", items);
    let totalPrice = 0;
    
    // If data hasn't loaded yet, keep original price
    if (!allItems || allItems.length === 0 || !allDetails || allDetails.length === 0) {
      totalPrice = existingPackage 
        ? (existingPackage.price || existingPackage.investedAmount || 0)
        : (basePackage ? parseFloat(basePackage.investedAmount) : 0);
      
      setCustomPackage(prev => ({ ...prev, investedAmount: totalPrice }));
      console.log("Using default price due to missing data:", totalPrice);
      return;
    }
    
    // For new packages, use base package price
    if (!existingPackage) {
      // Base price for new packages from the base package
      totalPrice = basePackage ? parseFloat(basePackage.investedAmount) : 0;
    }
    
    // Calculate price from all current items (for both new and existing packages)
    if (items && items.length > 0) {
      items.forEach(item => {
        const itemData = allItems.find(i => i.itemType === item.itemType);
        if (!itemData) return;
        
        const itemPrice = parseFloat(itemData.pricePerItem) || 0;
        const itemTotal = itemPrice * item.quantity;
        totalPrice += itemTotal;
        console.log(`Item: ${item.itemType}, Qty: ${item.quantity}, Price: ${itemPrice}, Total: ${itemTotal}`);
      });
    }
    
    // Add price for all details
    if (details && details.length > 0) {
      details.forEach(detail => {
        const detailData = allDetails.find(d => d.detailDescription === detail);
        if (!detailData) return;
        
        const detailPrice = parseFloat(detailData.pricePerDetail) || 0;
        totalPrice += detailPrice;
        console.log(`Detail: ${detail}, Price: ${detailPrice}`);
      });
    }

    // Update the total price
    console.log("Final calculated price:", totalPrice);
    setCustomPackage(prev => ({ ...prev, investedAmount: totalPrice }));
  };

  // Handle item selection change
  const handleItemSelectionChange = (e) => {
    setSelectedItemId(e.target.value);
  };

    // Handle detail selection change
        const handleDetailSelectionChange = (e) => {
        setSelectedDetailId(e.target.value);
    };

    // Add selected detail to package
const handleAddDetail = () => {
  if (!selectedDetailId) return;
  
  // Find the selected detail
  const selectedDetail = allDetails.find(detail => detail.detailId.toString() === selectedDetailId);
  
  if (!selectedDetail) return;
  
  // Check if detail already exists in the package
  const detailExists = customPackage.details.includes(selectedDetail.detailDescription);

  if (!detailExists) {
    // Add new detail
    const updatedDetails = [...customPackage.details, selectedDetail.detailDescription];
    
    setCustomPackage(prev => ({
      ...prev,
      details: updatedDetails
    }));
      // Recalculate the total price
    calculateTotalPrice(customPackage.items, updatedDetails);

    // Find the next available detail to select
    const remainingDetails = allDetails.filter(detail => 
      !customPackage.details.includes(detail.detailDescription) &&
      detail.detailId.toString() !== selectedDetailId
    );

    // If there are remaining details, select the first one
    if (remainingDetails.length > 0) {
      setSelectedDetailId(remainingDetails[0].detailId.toString());
    } else {
      // If no details remain, clear the selection
      setSelectedDetailId("");
    }
  }
};

// Handle detail removal
const handleRemoveDetail = (index) => {
  const detailToRemove = customPackage.details[index];

  // Store the removed detail's information
  const removedDetailDescription = detailToRemove;
  const removedDetailData = allDetails.find(detail => detail.detailDescription === removedDetailDescription);

  // Proceed with removal for non-base details
  const updatedDetails = customPackage.details.filter((_, i) => i !== index);
  
  setCustomPackage(prev => ({
    ...prev,
    details: updatedDetails
  }));
    // Recalculate total price with both items and details
  calculateTotalPrice(customPackage.items, updatedDetails);

  // If we have the removed detail data and the dropdown has no value selected, 
  // select the removed detail since it's now available again
  if (removedDetailData && (!selectedDetailId || selectedDetailId === "")) {
    setSelectedDetailId(removedDetailData.detailId.toString());
  }
};


  // Add selected item to package
  const handleAddItem = () => {
    if (!selectedItemId) return;
    
    // Find the selected item
    const selectedItem = allItems.find(item => item.itemId.toString() === selectedItemId);
    
    if (!selectedItem) return;
    
    // Check if item already exists in the package
    const existingItemIndex = customPackage.items.findIndex(
      item => item.itemType === selectedItem.itemType
    );    let updatedItems;
    
    if (existingItemIndex >= 0) {
        // Item already exists, increment quantity
        updatedItems = [...customPackage.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        setCustomPackage(prev => ({
            ...prev,
            items: updatedItems
        }));
    } else {
        // Add new item with quantity 1
        const newItem = {
            itemType: selectedItem.itemType,
            quantity: 1,
            itemId: selectedItem.itemId,
            pricePerItem: selectedItem.pricePerItem
        };
        
        updatedItems = [...customPackage.items, newItem];
        
        setCustomPackage(prev => ({
            ...prev,
            items: updatedItems
        }));
    }
    // recalculate the total price with updated items
    calculateTotalPrice( updatedItems, customPackage.details);

    // Find the next available item to select
    const remainingItems = allItems.filter(item => 
        !customPackage.items.some(packageItem => 
        packageItem.itemType === item.itemType
        ) && 
        item.itemType !== selectedItem.itemType
    );

    // If there are remaining items, select the first one
    if (remainingItems.length > 0) {
        setSelectedItemId(remainingItems[0].itemId.toString());
    } else {
        // If no items remain, clear the selection
        setSelectedItemId("");
    }
  };
  // Handle item quantity change
  const handleItemChange = (index, newQuantity) => {
    const updatedItems = [...customPackage.items];

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      updatedItems.splice(index, 1);
    } else {
      // Update quantity
      updatedItems[index].quantity = parseInt(newQuantity);
    }
  
    setCustomPackage(prev => ({
      ...prev,
      items: updatedItems
    }));
  
    // Recalculate total price with both items and details
    calculateTotalPrice(updatedItems, customPackage.details);
  };
  
  // Update detail
  const handleDetailChange = (index, value) => {
    const updatedDetails = [...customPackage.details];
    updatedDetails[index] = value;
    
    setCustomPackage(prev => ({
      ...prev,
      details: updatedDetails
    }));
  };

  // Remove item from package
    const handleRemoveItem = (index) => {
        const itemToRemove = customPackage.items[index];

        // Store the removed item's information
        const removedItemType = itemToRemove.itemType;
        const removedItemData = allItems.find(item => item.itemType === removedItemType);

        // Proceed with removal for non-base items
        const updatedItems = [...customPackage.items];
        updatedItems.splice(index, 1);
        
        setCustomPackage(prev => ({
            ...prev,
            items: updatedItems
        }));
          // Recalculate total price with both items and details
        calculateTotalPrice(updatedItems, customPackage.details);

        // If we have the removed item data and the dropdown has no value selected, 
        // select the removed item since it's now available again
        if (removedItemData && (!selectedItemId || selectedItemId === "")) {
            setSelectedItemId(removedItemData.itemId.toString());
        }
    };

    // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    //get the user from the loacal storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData ? userData.id : null;
    if (!userId) {
      alert("Please log in to save custom packages");
      return;
    }
    
    try {
      setLoading(true);
      
      // Format items and details back to string format for API
      const formattedPackage = {
        ...customPackage,
        userId: userId,
        items: customPackage.items.map(item => `${item.itemType}:${item.quantity}`).join(';'),
        details: customPackage.details.join(';')
      };

      console.log("Formatted Package Data:", formattedPackage);
      
      // Using fetch API instead of axios for consistency
      const response = await fetch(`${url}/api/packages/custom/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedPackage)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save custom package: ${response.status}`);
      }
      
      const savedPackage = await response.json();
      console.log("Successfully saved package:", savedPackage);
      onSubmit(savedPackage);
      onClose();
      
    } catch (error) {
      console.error('Error saving custom package:', error);
      alert("Failed to save custom package. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !basePackage) {
    return (
      <div className="package-modal-overlay">
        <div className="package-modal">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="modal-loading">Loading base package details...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="package-modal-overlay">
      <div className="package-modal custom-package-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>{existingPackage ? "Customize Package" : `${eventType} Package Customization`}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="custom-package-form">
          <div className="form-group">
            <label htmlFor="packageName">Package Name</label>
            <input
              type="text"
              id="packageName"
              name="packageName"
              value={customPackage.packageName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventName">Event Type</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={customPackage.eventName}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="packageTierName">Package Tier</label>
              <input
                type="text"
                id="packageTierName"
                name="packageTierName"
                value={customPackage.packageTierName}
                readOnly
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="coverageHours">Coverage Hours</label>
              <input
                type="number"
                id="coverageHours"
                name="coverageHours"
                min="1"
                max="24"
                value={customPackage.coverageHours}
                onChange={handleHoursChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="investedAmount">Investment</label>
              <input
                type="text"
                id="investedAmount"
                name="investedAmount"
                value={formatCurrency(customPackage.investedAmount)}
                readOnly
              />
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h3><PackageIcon className="small-icon" /> Package Items</h3>
              <div className="item-selection">
                <select 
                  value={selectedItemId} 
                  onChange={handleItemSelectionChange}
                  className="item-dropdown"
                >
                  {/* Filter out items that are already in the package */}
                    {allItems
                        .filter(item => !customPackage.items.some(
                        packageItem => packageItem.itemType === item.itemType
                        ))
                        .map(item => (
                        <option key={item.itemId} value={item.itemId}>
                            {item.itemType} ({formatCurrency(item.pricePerItem)})
                        </option>
                        ))
                    }
                </select>
                {allItems.filter(item => !customPackage.items.some(
                    packageItem => packageItem.itemType === item.itemType
                )).length === 0 && (
                    <div className="no-items-left">All items have been added to package</div>
                )}
                <button 
                    type="button"
                    className="add-item-btn"
                    onClick={handleAddItem}
                    disabled={allItems.filter(item => !customPackage.items.some(
                        packageItem => packageItem.itemType === item.itemType
                    )).length === 0} 
                >
                  Add Item
                </button>
              </div>
            </div>
            
            <div className="custom-items-list">
              {customPackage.items.map((item, index) => {
                // Check if this item is from the base package
                const isBaseItem = basePackageItems.some(
                    baseItem => baseItem.itemType === item.itemType
                );
                
                return (
                    <div key={index} className="custom-item-row">
                        <div className="item-info">
                        <span className="item-name">
                            {item.itemType}
                        </span>
                        <span className="item-price">
                            {formatCurrency(
                            allItems.find(i => i.itemType === item.itemType)?.pricePerItem * item.quantity || 0
                            )}
                        </span>
                        </div>
                        <div className="item-controls">
                        <div className="item-quantity-control">
                            <button 
                            type="button" 
                            className="qty-btn"
                            onClick={() => handleItemChange(index, Math.max(0, item.quantity - 1))}
                            >
                            -
                            </button>
                            <span className="item-quantity">{item.quantity}</span>
                            <button 
                            type="button" 
                            className="qty-btn"
                            onClick={() => handleItemChange(index, item.quantity + 1)}
                            >
                            +
                            </button>
                        </div>
                        <button 
                            type="button"
                            className="remove-item-btn"
                            onClick={() => handleRemoveItem(index)}
                            title="Remove item"
                        >
                            <X size={16} />
                        </button>
                        </div>
                    </div>
                    );
                })}
              {customPackage.items.length === 0 && (
                <p className="no-items-message">No items added to this package yet.</p>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
                <h3><Info className="small-icon" /> Package Details</h3>
                <div className="detail-selection">
                <select 
                    value={selectedDetailId} 
                    onChange={handleDetailSelectionChange}
                    className="detail-dropdown"
                >
                    {/* Filter out details that are already in the package */}
                    {allDetails
                    .filter(detail => !customPackage.details.includes(detail.detailDescription))
                    .map(detail => (
                        <option key={detail.detailId} value={detail.detailId}>
                        {detail.detailDescription} ({formatCurrency(detail.pricePerDetail)})
                        </option>
                    ))
                    }
                </select>
                {allDetails.filter(detail => !customPackage.details.includes(detail.detailDescription)).length === 0 && (
                    <div className="no-details-left">All details have been added to package</div>
                )}
                <button 
                    type="button"
                    className="add-detail-btn"
                    onClick={handleAddDetail}
                    disabled={allDetails.filter(detail => 
                    !customPackage.details.includes(detail.detailDescription)).length === 0} 
                >
                    Add Detail
                </button>
                </div>
            </div>
            
            <div className="custom-details-list">
                {customPackage.details.map((detail, index) => {
                // Check if this detail is from the base package
                const isBaseDetail = basePackageDetails.includes(detail);
                
                return (
                    <div key={index} className="custom-detail-row">
                    <div className="detail-info">
                    <span className="detail-description">
                        {detail}
                    </span>
                    <span className="detail-price">
                        {allDetails.find(d => d.detailDescription === detail) ? 
                        formatCurrency(allDetails.find(d => d.detailDescription === detail).pricePerDetail || 0) : 
                        formatCurrency(0)}
                    </span>
                    </div>
                    <button 
                    type="button"
                    className="remove-detail-btn"
                    onClick={() => handleRemoveDetail(index)}
                    title="Remove detail"
                    >
                    <X size={16} />
                    </button>
                </div>
                );
                })}
                {customPackage.details.length === 0 && (
                <p className="no-details-message">No details added to this package yet.</p>
                )}
            </div>
            </div>
          
          <button 
                type="submit" 
                className="book-package-btn"
                disabled={loading}
                >
                {loading ? "Saving..." : "Save Custom Package"}
            </button>
        </form>
      </div>
    </div>
  );
};

// Add this after the PackageCard component
const CustomPackageCard = ({ eventType, onClick }) => {
  return (
    <div className="package-card custom-package-card" onClick={onClick}>
      <div className="custom-package-icon">
        <Plus size={48} />
      </div>
      <div className="package-card-content">
        <h3 className="custom-package-name">Create Custom Package</h3>
        <p className="custom-package-description">Customize your own {eventType} package</p>
      </div>
      <div className="view-details">Customize</div>
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
      <div className="package-card-actions">
        <div className="view-details">View Details</div>
      </div>
    </div>
  );
};

// Main Packages Component
const Packages = () => {
    const { url, user } = useContext(StoreContext);
    const [packages, setPackages] = useState([]);
    const [customPackages, setCustomPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedEventType, setSelectedEventType] = useState(null);
    const [packageToCustomize, setPackageToCustomize] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
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
                // Parse items and details immediately to prevent undefined issues
                items: pkg.items ? parseItems(pkg.items) : [],
                details: pkg.details ? parseDetails(pkg.details) : []
            }));
            
            setPackages(transformedData);
            setError(null);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to fetch packages. Please try again.');
            
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's custom packages
    const fetchCustomPackages = async () => {
        if (!user) return;
        
        try {
            const response = await fetch(`${url}/api/packages/custom/get/${user.id}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch custom packages: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform data to match structure
            const transformedData = data.map(pkg => ({
                ...pkg,
                id: pkg.packageId,
                name: pkg.packageName,
                tier: pkg.packageTierName,
                price: parseFloat(pkg.investedAmount || 0),
                items: pkg.items ? parseItems(pkg.items) : [],
                details: pkg.details ? parseDetails(pkg.details) : [],
                isCustom: true
            }));
            
            setCustomPackages(transformedData);
        } catch (error) {
            console.error('Error fetching custom packages:', error);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [url]);

    useEffect(() => {
        fetchCustomPackages();
    }, [url, user]);

    // Get unique event types for organizing packages
    const eventTypes = [...new Set([
        ...packages.map(pkg => pkg.eventName),
        ...customPackages.map(pkg => pkg.eventName)
    ])];

    // Modal handlers
    const openModal = (pkg) => {
        setSelectedPackage(pkg);
        setShowModal(true);
        document.body.style.overflow = 'hidden'; 
    };

    const closeModal = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    // Custom package modal handlers
    const openCustomModal = (eventType, packageData = null) => {
        if (packageData) {
            // We're customizing an existing package
            setPackageToCustomize(packageData);
            setSelectedEventType(packageData.eventName);
        } else {
            // We're creating a new custom package
            setPackageToCustomize(null);
            setSelectedEventType(eventType);
        }
        setShowCustomModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closeCustomModal = () => {
        setShowCustomModal(false);
        setPackageToCustomize(null);
        document.body.style.overflow = 'auto';
    };

    // Handle custom package submission
    const handleCustomPackageSubmit = (newPackage) => {
        setCustomPackages(prev => {
            // If we're editing an existing custom package, replace it
            if (packageToCustomize && packageToCustomize.isCustom) {
                return prev.map(pkg => 
                    pkg.id === packageToCustomize.id ? {
                        ...newPackage,
                        id: newPackage.packageId,  // Make sure this is correct
                        name: newPackage.packageName,
                        tier: newPackage.packageTierName,
                        price: parseFloat(newPackage.investedAmount || 0),
                        items: newPackage.items ? (typeof newPackage.items === 'string' ? parseItems(newPackage.items) : newPackage.items) : [],
                        details: newPackage.details ? (typeof newPackage.details === 'string' ? parseDetails(newPackage.details) : newPackage.details) : [],
                        isCustom: true
                    } : pkg
                );
            } else {
                // Otherwise add it as a new custom package
                // Make sure to correctly assign the ID from the server response
                console.log("New package from server:", newPackage); // Add this to debug
                return [...prev, {
                    ...newPackage,
                    id: newPackage.packageId, // This might be the issue
                    name: newPackage.packageName,
                    tier: newPackage.packageTierName,
                    price: parseFloat(newPackage.investedAmount || 0),
                    items: newPackage.items ? (typeof newPackage.items === 'string' ? parseItems(newPackage.items) : newPackage.items) : [],
                    details: newPackage.details ? (typeof newPackage.details === 'string' ? parseDetails(newPackage.details) : newPackage.details) : [],
                    isCustom: true
                }];
            }
        });
    };

    // Handler for package customization
    const handleCustomizePackage = (packageData) => {
        openCustomModal(null, packageData);
    };    // Filter packages based on search query
    const filteredStandardPackages = packages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.eventName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredCustomPackages = customPackages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.eventName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="packages-loading">Loading packages...</div>;
    }

    if (error && packages.length === 0) {
        return <div className="packages-error">{error}</div>;
    }

    return (
        <div className="packages-content">            <div className="packages-container">
                <h1 className="packages-title">Photography Packages</h1>
                <p className="packages-subtitle">Choose the perfect package for your special moments</p>
                  {/* Search Bar */}
                <div className="packages-search-container">
                    <input
                        type="text"
                        className="packages-search-input"
                        placeholder="Search packages by name or event type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="packages-search-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
                
                {/* No results message */}
                {searchQuery && filteredStandardPackages.length === 0 && filteredCustomPackages.length === 0 && (
                    <div className="no-search-results">
                        <p>No packages found matching "{searchQuery}"</p>
                        <button 
                            className="clear-search-btn" 
                            onClick={() => setSearchQuery('')}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
                
                {eventTypes.map(eventType => {
                    // Get packages for this event type
                    const standardPackages = filteredStandardPackages.filter(pkg => pkg.eventName === eventType);
                    const userCustomPackages = user ? filteredCustomPackages.filter(pkg => 
                        pkg.eventName === eventType && pkg.userId === user.id
                    ) : [];
                    const combinedPackages = [...standardPackages, ...userCustomPackages];
                    
                    // Skip rendering this event section if there are no packages matching the search
                    if (combinedPackages.length === 0 && searchQuery) {
                        return null;
                    }
                    
                    return (
                        <div key={eventType} className="event-section">
                            <h2 className="event-title">{eventType}</h2>
                            <div className="event-divider"></div>
                            
                            <div className="event-packages">
                                {combinedPackages.map(pkg => (
                                    <PackageCard 
                                        key={pkg.id || pkg.packageId} 
                                        packageData={pkg} 
                                        onClick={() => openModal(pkg)}
                                        onCustomize={handleCustomizePackage}
                                    />
                                ))}
                                
                                {/* Add custom package card */}
                                <CustomPackageCard 
                                    eventType={eventType} 
                                    onClick={() => openCustomModal(eventType)}
                                />
                            </div>
                        </div>
                    );
                })}
                {showModal && selectedPackage && (
                    <PackageModal 
                        packageData={selectedPackage} 
                        onClose={closeModal}
                        onCustomize={handleCustomizePackage}
                    />
                )}
                
                {showCustomModal && (
                    <CustomPackageModal 
                        eventType={selectedEventType}
                        existingPackage={packageToCustomize}
                        onClose={closeCustomModal}
                        onSubmit={handleCustomPackageSubmit}
                    />
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Packages;