import React, { useState, useEffect } from 'react';
import './ManagePackages.css';
import { X, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

const ManagePackages = () => {
    const [packages, setPackages] = useState([]);
    const [events, setEvents] = useState([]);
    const [packageTiers, setPackageTiers] = useState([]);
    const [packageItems, setPackageItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [packageDetails, setPackageDetails] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [successAlert, setSuccessAlert] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [alertType, setAlertType] = useState('success');

    // fetch all pacakges
    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("http://localhost:4000/api/packages");
            const data = await response.json();
            setPackages(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to fetch packages. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccessAlert = (message, type = 'success') => {
        setSuccessAlert(message);
        setAlertType(type);
        
        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
            setSuccessAlert(null);
        }, 5000);
    };

    // fetch all events 
    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/packages/events");
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // fetch all package tiers
    const fetchPackageTiers = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/packages/tiers");
            const data = await response.json();
            setPackageTiers(data);
        } catch (error) {
            console.error('Error fetching package tiers:', error);
        }
    };
    
    // fetch package items
    const fetchPackageItems = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/packages/items");
            const data = await response.json();
            setPackageItems(data);
        } catch (error) {
            console.error('Error fetching package items:', error);
        }
    };

    // fetch package details
    const fetchPackageDetails = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/packages/details");
            const data = await response.json();
            setPackageDetails(data);
        } catch (error) {
            console.error('Error fetching package details:', error);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchEvents();
        fetchPackageTiers();
        fetchPackageItems();
        fetchPackageDetails();
    }, []);

    // Handle item selection
    const handleItemSelect = (e) => {
        const itemId = parseInt(e.target.value);
        if (itemId) {
            const selectedItem = packageItems.find(item => item.itemId === itemId);
            if (selectedItem && !selectedItems.some(item => item.itemId === itemId)) {
                setSelectedItems([...selectedItems, {
                    itemId: selectedItem.itemId,
                    itemType: selectedItem.itemType,
                    quantity: 1
                }]);
            }
        }
    };

    // Handle detail selection
    const handleDetailSelect = (e) => {
        const detailId = parseInt(e.target.value);
        if (detailId) {
            const selectedDetail = packageDetails.find(detail => detail.detailId === detailId);
            if (selectedDetail && !selectedDetails.some(detail => detail.detailId === detailId)) {
                setSelectedDetails([...selectedDetails, {
                    detailId: selectedDetail.detailId,
                    detailDescription: selectedDetail.detailDescription
                }]);
            }
        }
    };

    // Handle quantity change
    const handleQuantityChange = (itemId, quantity) => {
        setSelectedItems(selectedItems.map(item => 
            item.itemId === itemId ? { ...item, quantity: parseInt(quantity) || 0 } : item
        ));
    };

    // Remove selected item
    const removeSelectedItem = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
    };

    // Remove selected detail
    const removeSelectedDetail = (detailId) => {
        setSelectedDetails(selectedDetails.filter(detail => detail.detailId !== detailId));
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.coverageHours.toString().includes(searchTerm.toLowerCase())
    );


    const handleDeletePackage = async (packageId, packageName, e) => {
        e.stopPropagation();

        // Ask for confirmation before deleting
        if (window.confirm(`Are you sure you want to delete the package "${packageName}"?`)) {
            try {
                await axios.delete(`http://localhost:4000/api/packages/${packageId}`);
                
                // Show success message
                showSuccessAlert(`Package "${packageName}" deleted successfully!`, 'delete');
                
                // Refresh packages list
                fetchPackages();
            } catch (error) {
                console.error('Error deleting package:', error);
                setError('Failed to delete package. Please try again.');
            }
        }
    }

    // Edit Package Handler
    const handleEditPackage = (pkg, e) => {
        e.stopPropagation();
        
        // Set the package to edit mode
        setIsAddModalOpen(true);
        setIsEditMode(true);
        setSelectedPackage(pkg);

        // Prepare selected items
        const itemsToSelect = pkg.items ? 
        pkg.items.split(';').reduce((acc, itemStr) => {
            // Use a more flexible regex to handle different formats
            const match = itemStr.trim().match(/(.+?)\s*\((\d+)\)/);
            if (match) {
                const [, itemType, quantityStr] = match;
                const matchedItem = packageItems.find(item => 
                    item.itemType.trim() === itemType.trim()
                );
                if (matchedItem) {
                    acc.push({
                        itemId: matchedItem.itemId,
                        itemType: matchedItem.itemType,
                        quantity: parseInt(quantityStr) || 1
                    });
                }
            }
            return acc;
        }, [])
        : [];
        setSelectedItems(itemsToSelect);

        // Prepare selected details
        const detailsToSelect = pkg.details ? 
        pkg.details.split(';').reduce((acc, detailDescription) => {
            const matchedDetail = packageDetails.find(detail => 
                detail.detailDescription.trim() === detailDescription.trim()
            );
            if (matchedDetail) {
                acc.push(matchedDetail);
            }
            return acc;
        }, [])
        : [];
        setSelectedDetails(detailsToSelect);

    };

    const handlePackageSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormError(null);

        try {
            const packageData = {
                packageName: e.target.packageName.value,
                coverageHours: parseInt(e.target.coverageHours.value),
                eventName: e.target.eventName.value,
                packageTier: e.target.packageTier.value,
                investedAmount: parseFloat(e.target.investedAmount.value) || 0,
                items: selectedItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity
                })),
                details: selectedDetails.map(detail => detail.detailId)
            };

            let response;
            if (isEditMode && selectedPackage) {
                // Update existing package
                response = await axios.put(`http://localhost:4000/api/packages/${selectedPackage.packageId}`, packageData);
                showSuccessAlert(`Package "${packageData.packageName}" updated successfully!`, 'update');
            } else {
                // Create new package
                response = await axios.post('http://localhost:4000/api/packages/create', packageData);
                showSuccessAlert(`Package "${packageData.packageName}" added successfully!`, 'success');
            }

            // Close the modal and refresh the packages list
            setIsAddModalOpen(false);
            setIsEditMode(false);
            fetchPackages();

            // Reset form state
            setSelectedItems([]);
            setSelectedDetails([]);
            setSelectedPackage(null);
        } catch (error) {
            console.error('Failed to submit package:', error);
            setFormError(error.response?.data?.message || error.message || 'An error occurred while submitting the package. Please try again.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (isLoading) {
        return <div className="loading">Loading packages...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="packages-management">
            <div className="search-and-add-container">
                <input
                    type="text"
                    placeholder="Search packages by name or hours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button 
                    className="add-package-btn"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Package
                </button>
            </div>

            <div className="packages-grid">
                {filteredPackages.map((pkg) => (
                    <div 
                        key={pkg.packageId} 
                        className="package-card"
                        onClick={() => setSelectedPackage(pkg)}
                    >
                        <div className="package-name">{pkg.packageName}</div>
                        <div className="package-event">{pkg.eventName}</div>
                        <div className="package-tier">{pkg.packageTierName}</div>
                        <div className="package-footer">
                            {pkg.investedAmount !== undefined && (
                                <div className="package-investment">
                                    {formatCurrency(pkg.investedAmount)}
                                </div>
                            )}
                            <div className="package-actions">
                                <button 
                                    className="edit-package-btn"
                                    onClick={(e) => handleEditPackage(pkg, e)}
                                    aria-label="Edit package"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    className="delete-package-btn"
                                    onClick={(e) => handleDeletePackage(pkg.packageId, pkg.packageName, e)}
                                    aria-label="Delete package"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedPackage && (
                <div className="package-modal">
                    <div className="package-modal-content">
                        <button 
                            className="close-button"
                            onClick={() => setSelectedPackage(null)}
                        >
                            ×
                        </button>
                        <h2>{selectedPackage.packageName}</h2>
                        <p><strong>Coverage Hours:</strong> {selectedPackage.coverageHours}</p>
                        <p><strong>Event Name:</strong> {selectedPackage.eventName}</p>
                        <p><strong>Package Tier:</strong> {selectedPackage.packageTierName}</p>
                        <p><strong>Investment:</strong>{selectedPackage.investedAmount}</p>
                        {selectedPackage.investmentAmount !== undefined && (
                            <p><strong>Investment Amount:</strong> {formatCurrency(selectedPackage.investedAmount)}</p>
                        )}
                        
                        <p><strong>Package Items:</strong></p>
                        <ul>
                            {selectedPackage.items.split(';').map((item, index) => (
                                <li key={index}>{item.trim()}</li>
                            ))}
                        </ul>

                        <p><strong>Package Details:</strong></p>
                        <ul>
                            {selectedPackage.details.split(';').map((detail, index) => (
                                <li key={index}>{detail.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="package-modal">
                    <div className="package-modal-content">
                    <h2>{isEditMode ? 'Edit Package' : 'Add New Package'}</h2>
                        <form onSubmit={handlePackageSubmit}>
                            <div className="form-group">
                                <label htmlFor="packageName">Package Name</label>
                                <input 
                                    type="text" 
                                    id="packageName" 
                                    name="packageName" 
                                    required 
                                    defaultValue={isEditMode ? selectedPackage?.packageName : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="coverageHours">Coverage Hours</label>
                                <input 
                                    type="number" 
                                    id="coverageHours" 
                                    name="coverageHours" 
                                    required 
                                    defaultValue={isEditMode ? selectedPackage?.coverageHours : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="investedAmount">Investment Amount ($)</label>
                                <input 
                                    type="number" 
                                    id="investedAmount" 
                                    name="investedAmount" 
                                    step="0.01" 
                                    min="0"
                                    placeholder="0.00"
                                    required 
                                    defaultValue={isEditMode ? selectedPackage?.investedAmount : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventName">Event Name</label>
                                <select 
                                    id="eventName" 
                                    name="eventName" 
                                    required
                                    defaultValue={isEditMode ? selectedPackage?.eventName : ''}
                                >
                                    <option value="">Select an event</option>
                                    {events.map((event) => (
                                        <option 
                                            key={event.eventId} 
                                            value={event.eventName}
                                        >
                                            {event.eventName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="packageTier">Package Tier</label>
                                <select 
                                    id="packageTier" 
                                    name="packageTier" 
                                    required
                                >
                                    <option value="">Select a package tier</option>
                                    {packageTiers.map((tier) => (
                                        <option 
                                            key={tier.packageTierId} 
                                            value={tier.packageTierName}
                                        >
                                            {tier.packageTierName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Package Items Section */}
                            <div className="form-section">
                                <h3>Package Items</h3>
                                <div className="form-group">
                                    <label htmlFor='itemSelect'>Select Item</label>
                                    <select 
                                        id="itemSelect" 
                                        onChange={handleItemSelect}
                                        value=""
                                    >
                                        <option value="">Choose an item to add</option>
                                        {packageItems
                                            .filter(item => !selectedItems.some(selected => selected.itemId === item.itemId))
                                            .map((item) => (
                                                <option 
                                                    key={item.itemId} 
                                                    value={item.itemId}
                                                >
                                                    {item.itemType}
                                                </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedItems.length > 0 && (
                                    <div className="selected-items-list">
                                        <h3 className="text-lg font-semibold mb-3">Selected Items:</h3>
                                        {selectedItems.map((item) => (
                                            <div key={item.itemId} className="selected-item-card">
                                                <div className="item-content">
                                                    <span className="item-type-badge">{item.itemType}</span>
                                                    <div className="item-controls">
                                                        <div className="quantity-control">
                                                            <button
                                                                type="button"
                                                                className="quantity-btn"
                                                                onClick={() => handleQuantityChange(item.itemId, Math.max(1, item.quantity - 1))}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                                                                className="quantity-input"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="quantity-btn"
                                                                onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSelectedItem(item.itemId)}
                                                            className="remove-btn"
                                                            aria-label="Remove item"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Package Details Section */}
                            <div className="form-section">
                                <h3>Package Details</h3>
                                <div className="form-group">
                                    <label htmlFor='detailSelect'>Select Detail</label>
                                    <select 
                                        id="detailSelect" 
                                        onChange={handleDetailSelect}
                                        value=""
                                    >
                                        <option value="">Choose a detail to add</option>
                                        {packageDetails
                                            .filter(detail => !selectedDetails.some(selected => selected.detailId === detail.detailId))
                                            .map((detail) => (
                                                <option 
                                                    key={detail.detailId} 
                                                    value={detail.detailId}
                                                >
                                                    {detail.detailDescription}
                                                </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedDetails.length > 0 && (
                                    <div className="selected-details-list">
                                        <h3 className="text-lg font-semibold mb-3">Selected Details:</h3>
                                        {selectedDetails.map((detail) => (
                                            <div key={detail.detailId} className="selected-item-card">
                                                <div className="item-content">
                                                    <span className="detail-description">{detail.detailDescription}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedDetail(detail.detailId)}
                                                        className="remove-btn"
                                                        aria-label="Remove detail"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                            <div className="modal-cancel">
                            <button 
                                    type="button"
                                    className='cancel-btn' 
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setIsEditMode(false);
                                        setSelectedItems([]);
                                        setSelectedDetails([]);
                                        setSelectedPackage(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                                <button className="submit-btn" type="submit">
                                    {isEditMode ? 'Update Package' : 'Add Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {successAlert && (
                <div className="success-alert">
                    <div className={`success-alert-content alert-${alertType}`}>
                        <span className="success-icon">✓</span>
                        {successAlert}
                        <button 
                            className="close-alert-button"
                            onClick={() => setSuccessAlert(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePackages;