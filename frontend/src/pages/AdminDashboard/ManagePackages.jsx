import React, { useState, useEffect, useContext } from 'react';
import './ManagePackages.css';
import { Trash2, Edit, Plus, X, Save, ArrowLeft, Eye, Database, Calendar, Box, FileText } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
const ManagePackages = () => {
    const { url } = useContext(StoreContext);
    const [packages, setPackages] = useState([]);
    const [events, setEvents] = useState([]);
    const [packageTiers, setPackageTiers] = useState([]);
    const [packageItems, setPackageItems] = useState([]);
    const [packageDetails, setPackageDetails] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [successAlert, setSuccessAlert] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [totalInvestment, setTotalInvestment] = useState(0);    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('all');

    // Calculate the total investment amount based on selected items and details
    const calculateTotalInvestment = () => {
        let total = 0;
        
        // Calculate price from selected items
        if (selectedItems && selectedItems.length > 0) {
            selectedItems.forEach(item => {
                const itemData = packageItems.find(i => i.itemId === item.itemId);
                if (itemData) {
                    const itemPrice = parseFloat(itemData.pricePerItem) || 0;
                    const itemTotal = itemPrice * item.quantity;
                    total += itemTotal;
                    console.log(`Item: ${itemData.itemType}, Qty: ${item.quantity}, Price: ${itemPrice}, Total: ${itemTotal}`);
                }
            });
        }
        
        // Add price for all details
        if (selectedDetails && selectedDetails.length > 0) {
            selectedDetails.forEach(detail => {
                const detailData = packageDetails.find(d => d.detailId === detail.detailId);
                if (detailData) {
                    const detailPrice = parseFloat(detailData.pricePerDetail) || 0;
                    total += detailPrice;
                    console.log(`Detail: ${detailData.detailDescription}, Price: ${detailPrice}`);
                }
            });
        }
        
        console.log("Final calculated investment:", total);
        return total;
    };

    // Fetch functions
    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${url}/api/packages`);
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

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${url}/api/packages/pkg/events`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchPackageTiers = async () => {
        try {
            const response = await fetch(`${url}/api/packages/pkg/tiers`);
            const data = await response.json();
            setPackageTiers(data);
        } catch (error) {
            console.error('Error fetching package tiers:', error);
        }
    };

    const fetchPackageItems = async () => {
        try {
            const response = await fetch(`${url}/api/packages/pkg/items`);
            const data = await response.json();
            setPackageItems(data);
        } catch (error) {
            console.error('Error fetching package items:', error);
        }
    };

    const fetchPackageDetails = async () => {
        try {
            const response = await fetch(`${url}/api/packages/pkg/details`);
            const data = await response.json();
            setPackageDetails(data);
        } catch (error) {
            console.error('Error fetching package details:', error);
        }
    };    useEffect(() => {
        fetchPackages();
        fetchEvents();
        fetchPackageTiers();
        fetchPackageItems();
        fetchPackageDetails();
    }, []);
    
    // Effect to calculate investment amount when items or details change
    useEffect(() => {
        // Only calculate if we're in edit mode or adding a new package
        if ((isEditMode || isAddingNew) && packageItems.length > 0 && packageDetails.length > 0) {
            // Short delay to ensure DOM is ready
            setTimeout(() => {
                const investedAmountInput = document.getElementById('investedAmount');
                if (investedAmountInput) {
                    const calculatedAmount = calculateTotalInvestment();
                    investedAmountInput.value = calculatedAmount.toFixed(2);
                }
            }, 100);
        }
    }, [selectedItems, selectedDetails, isEditMode, isAddingNew, packageItems, packageDetails]);

    // Alert handling
    const showSuccessAlert = (message, type = 'success') => {
        setSuccessAlert(message);
        setAlertType(type);
        setTimeout(() => {
            setSuccessAlert(null);
        }, 5000);
    };

    // create a tabs
    const PackageTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="package-tabs">
        <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
        >
            All Packages
        </button>
        <button 
            className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
        >
            Custom Packages
        </button>
        </div>
    );
    };    // Form handling
    const handleItemSelect = (e) => {
        const itemId = parseInt(e.target.value);
        if (itemId) {
            const selectedItem = packageItems.find(item => item.itemId === itemId);
            if (selectedItem && !selectedItems.some(item => item.itemId === itemId)) {
                setSelectedItems(prev => [...prev, {
                    itemId: selectedItem.itemId,
                    itemType: selectedItem.itemType,
                    quantity: 1
                }]);
                
                // Update investment amount after a small delay to ensure state is updated
                setTimeout(() => {
                    const calculatedAmount = calculateTotalInvestment();
                    document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
                }, 100);
            }
        }
    };

    const handleDetailSelect = (e) => {
        const detailId = parseInt(e.target.value);
        if (detailId) {
            const selectedDetail = packageDetails.find(detail => detail.detailId === detailId);
            if (selectedDetail && !selectedDetails.some(detail => detail.detailId === detailId)) {
                setSelectedDetails(prev => [...prev, {
                    detailId: selectedDetail.detailId,
                    detailDescription: selectedDetail.detailDescription
                }]);
                
                // Update investment amount after a small delay to ensure state is updated
                setTimeout(() => {
                    const calculatedAmount = calculateTotalInvestment();
                    document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
                }, 100);
            }
        }
    };

    const handleQuantityChange = (itemId, quantity) => {
        setSelectedItems(selectedItems.map(item => 
            item.itemId === itemId ? { ...item, quantity: parseInt(quantity) || 0 } : item
        ));
        
        // Update investment amount after a small delay to ensure state is updated
        setTimeout(() => {
            const calculatedAmount = calculateTotalInvestment();
            document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
        }, 100);
    };

    const removeSelectedItem = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
        
        // Update investment amount after a small delay to ensure state is updated
        setTimeout(() => {
            const calculatedAmount = calculateTotalInvestment();
            document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
        }, 100);
    };

    const removeSelectedDetail = (detailId) => {
        setSelectedDetails(selectedDetails.filter(detail => detail.detailId !== detailId));
        
        // Update investment amount after a small delay to ensure state is updated
        setTimeout(() => {
            const calculatedAmount = calculateTotalInvestment();
            document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
        }, 100);
    };const handleEditPackage = (pkg) => {
        try {
            console.log("Edit Package triggered with:", pkg);
            setIsEditMode(true);
            setSelectedPackage(pkg);
            setIsAddingNew(false);

            // Prepare selected items
            const itemsToSelect = pkg.items ? 
            pkg.items.split(';').reduce((acc, itemStr) => {
                // Improved parsing for different item string formats
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
                
                // Find the matching item in packageItems array
                const matchedItem = packageItems.find(item => 
                    item.itemType.trim().toLowerCase() === itemType.trim().toLowerCase()
                );
                
                if (matchedItem) {
                    acc.push({
                        itemId: matchedItem.itemId,
                        itemType: matchedItem.itemType,
                        quantity: parseInt(quantity) || 1
                    });
                } else {
                    console.log(`Could not find matching item for '${itemType}'`);
                }
                
                return acc;
            }, [])
            : [];
            console.log("Parsed items:", itemsToSelect);
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
            : [];            console.log("Parsed details:", detailsToSelect);
            setSelectedDetails(detailsToSelect);

            console.log("Edit mode enabled with package:", pkg.packageId);
            
            // Calculate the initial investment amount after a small delay to ensure state is updated
            setTimeout(() => {
                const calculatedAmount = calculateTotalInvestment();
                document.getElementById('investedAmount').value = calculatedAmount.toFixed(2);
            }, 100);
        } catch (error) {
            console.error("Error in handleEditPackage:", error);
            setError("Failed to prepare package for editing. Please try again.");
        }
    };    const handleViewPackage = (pkg) => {
        setIsViewMode(true);
        setSelectedPackage(pkg);
        setIsAddingNew(false);
        setIsEditMode(false);

        // Prepare selected items for viewing
        const itemsToSelect = pkg.items ? 
        pkg.items.split(';').reduce((acc, itemStr) => {
            // Improved parsing for different item string formats
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
            
            // Find the matching item in packageItems array
            const matchedItem = packageItems.find(item => 
                item.itemType.trim().toLowerCase() === itemType.trim().toLowerCase()
            );
            
            if (matchedItem) {
                acc.push({
                    itemId: matchedItem.itemId,
                    itemType: matchedItem.itemType,
                    quantity: parseInt(quantity) || 1
                });
            } else {
                console.log(`Could not find matching item for '${itemType}'`);
            }
            
            return acc;
        }, [])
        : [];
        setSelectedItems(itemsToSelect);

        // Prepare selected details for viewing
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

    // Handle switching from view to edit mode
    const handleEditFromView = () => {
        setIsViewMode(false);
        setIsEditMode(true);
    };

    const openDeleteModal = (pkg) => {
        setPackageToDelete(pkg);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPackageToDelete(null);
        setDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${url}/api/packages/${packageToDelete.packageId}`);
            showSuccessAlert(`Package "${packageToDelete.packageName}" deleted successfully!`, 'delete');
            fetchPackages();
            closeDeleteModal();        } catch (error) {
            console.error('Error deleting package:', error);
            setError('Failed to delete package. Please try again.');
            closeDeleteModal();
        }
    };    const handlePackageSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);

        try {                
            // Calculate total investment amount based on selected items and details
            const calculatedInvestmentAmount = parseFloat(calculateTotalInvestment()).toFixed(2);
            
            const packageData = {
                packageName: e.target.packageName.value,
                eventName: e.target.eventName.value,
                packageTier: e.target.packageTier.value,
                investedAmount: calculatedInvestmentAmount,
                items: selectedItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity
                })),
                details: selectedDetails.map(detail => detail.detailId)
            };

            console.log('Package data for submission:', packageData);

            if (isEditMode && selectedPackage) {
                console.log('Updating package with ID:', selectedPackage.packageId);
                try {
                    const response = await axios.put(`${url}/api/packages/${selectedPackage.packageId}`, packageData);
                    console.log('Update response:', response.data);
                    showSuccessAlert(`Package "${packageData.packageName}" updated successfully!`, 'update');
                } catch (updateError) {
                    console.error('Update request failed:', updateError);
                    console.error('Update error details:', updateError.response?.data);
                    throw updateError;
                }
            } else {
                try {
                    const response = await axios.post(`${url}/api/packages/create`, packageData);
                    console.log('Create response:', response.data);
                    showSuccessAlert(`Package "${packageData.packageName}" added successfully!`, 'success');
                } catch (createError) {
                    console.error('Create request failed:', createError);
                    console.error('Create error details:', createError.response?.data);
                    throw createError;
                }
            }
            
            // Fetch updated packages and reset form
            await fetchPackages();
            setIsEditMode(false);
            setIsAddingNew(false);
            setSelectedPackage(null);
            setSelectedItems([]);
            setSelectedDetails([]);        } catch (error) {
            console.error('Failed to submit package:', error);
            console.error('Error details:', error.response?.data);            
            setError(error.response?.data?.message || error.message || 'An error occurred while submitting the package. Please try again.');
            showSuccessAlert(`Failed to ${isEditMode ? 'update' : 'add'} package. ${error.message}`, 'error');
        } finally {
            setFormSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleAddEvent = () => {
        setEventModalOpen(true);
    };
    
    const handleAddItem = () => {
        setItemModalOpen(true);
    };
    
    const handleAddDetail = () => {
        setDetailModalOpen(true);
    };

    // Handle event added callback
    const handleEventAdded = (eventData, eventName) => {
        fetchEvents();
        showSuccessAlert(`Event "${eventName}" added successfully!`, 'success');
    };

    const handleItemAdded = (itemData, itemType) => {
        fetchPackageItems();
        if (itemType) {
            showSuccessAlert(`Item "${itemType}" added successfully!`, 'success');
        }
    };

    const handleDetailAdded = (detailData, detailDescription) => {
        fetchPackageDetails();
        if (detailDescription) {
            showSuccessAlert(`Detail "${detailDescription}" added successfully!`, 'success');
        }
    };
    
    // New handlers for deleting events, items, and details
    const handleDeleteEvent = async (eventId, eventName) => {
        if (window.confirm(`Are you sure you want to delete the event "${eventName}"?`)) {
            try {
                await axios.delete(`${url}/api/packages/pkg/events/${eventId}`);
                showSuccessAlert(`Event "${eventName}" deleted successfully!`, 'delete');
                fetchEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                setError('Failed to delete event. Please try again.');
            }
        }
    };
    
    const handleDeleteItem = async (itemId, itemType) => {
        if (window.confirm(`Are you sure you want to delete the item "${itemType}"?`)) {
            try {
                await axios.delete(`${url}/api/packages/pkg/items/${itemId}`);
                showSuccessAlert(`Item "${itemType}" deleted successfully!`, 'delete');
                fetchPackageItems();
            } catch (error) {
                console.error('Error deleting item:', error);
                setError('Failed to delete item. Please try again.');
            }
        }
    };
    
    const handleDeleteDetail = async (detailId, detailDescription) => {
        if (window.confirm(`Are you sure you want to delete the detail "${detailDescription}"?`)) {
            try {
                await axios.delete(`${url}/api/packages/pkg/details/${detailId}`);
                showSuccessAlert(`Detail "${detailDescription}" deleted successfully!`, 'delete');
                fetchPackageDetails();
            } catch (error) {
                console.error('Error deleting detail:', error);
                setError('Failed to delete detail. Please try again.');
            }
        }
    };    const filteredPackages = packages.filter(pkg =>
        pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.username && pkg.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return <div className="loading">Loading packages...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    // Render view mode
    if (isViewMode && selectedPackage) {
        return (
            <div className="packages-management">
                <div className="form-header">
                    <button 
                        className="back-btn"
                        onClick={() => {
                            setIsViewMode(false);
                            setSelectedPackage(null);
                            setSelectedItems([]);
                            setSelectedDetails([]);
                        }}
                    >
                        <ArrowLeft size={20} /> Back to List
                    </button>
                    <h2>View Package Details</h2>
                </div>

                <div className="view-package-container">
                    <div className="view-package-header">
                        <h2>{selectedPackage.packageName}</h2>
                    </div>

                    <div className="view-package-grid">                        
                    <div className="view-package-field">
                            <label>Package Name</label>
                            <div className="value">{selectedPackage.packageName}</div>
                        </div>
                        <div className="view-package-field">
                            <label>Username</label>
                            <div className="value">{selectedPackage.username || 'Not assigned'}</div>
                        </div>                        <div className="view-package-field">
                            <label>Investment Amount</label>
                            <div className="value">{formatCurrency(selectedPackage.investedAmount)}</div>
                            <button 
                                type="button"
                                className="show-calculation-btn"
                                onClick={() => {
                                    const calculatedAmount = calculateTotalInvestment();
                                    alert(`Investment breakdown:\n\n${
                                        selectedItems.map(item => {
                                            const itemData = packageItems.find(i => i.itemId === item.itemId);
                                            if (!itemData) return '';
                                            const price = parseFloat(itemData.pricePerItem) || 0;
                                            return `${itemData.itemType} (${item.quantity}) × ${formatCurrency(price)} = ${formatCurrency(price * item.quantity)}`;
                                        }).join('\n')
                                    }\n\n${
                                        selectedDetails.map(detail => {
                                            const detailData = packageDetails.find(d => d.detailId === detail.detailId);
                                            if (!detailData) return '';
                                            return `${detailData.detailDescription}: ${formatCurrency(detailData.pricePerDetail)}`;
                                        }).join('\n')
                                    }\n\nTotal: ${formatCurrency(calculatedAmount)}`);
                                }}
                            >
                                View Calculation
                            </button>
                        </div>
                        <div className="view-package-field">
                            <label>Event Type</label>
                            <div className="value">{selectedPackage.eventName}</div>
                        </div>
                        <div className="view-package-field">
                            <label>Package Tier</label>
                            <div className="value">{selectedPackage.packageTierName}</div>
                        </div>
                    </div>                    
                    
                    {/* Package Items Section */}
                    <div className="view-package-section">
                        <h3>Package Items</h3>
                        {selectedPackage.items ? (
                            <div className="item-list">
                                {selectedPackage.items.split(';').map((itemStr, index) => {
                                    // Parse the item string to extract item type and quantity
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
                                            // Just take the whole string as item type
                                            itemType = itemStr.trim();
                                            quantity = 1;
                                        }
                                    }
                                    
                                    return (
                                        <div key={index} className="item-card">
                                            <div className="item-info">
                                                {itemType}
                                                <span className="quantity"> {quantity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No items in this package</p>
                        )}
                    </div>

                    {/* Package Details Section */}
                    <div className="view-package-section">
                        <h3>Package Details</h3>
                        {selectedDetails.length > 0 ? (
                            <div className="detail-list">
                                {selectedDetails.map((detail) => (
                                    <div key={detail.detailId} className="detail-card">
                                        {detail.detailDescription}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No details for this package</p>
                        )}
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button"
                            className="cancel-btn" 
                            onClick={() => {
                                setIsViewMode(false);
                                setSelectedPackage(null);
                                setSelectedItems([]);
                                setSelectedDetails([]);
                            }}
                        >
                            Back to List
                        </button>
                        <button 
                            type="button" 
                            className="edit-btn-large"
                            onClick={handleEditFromView}
                        >
                            <Edit size={20} /> Edit Package
                        </button>
                    </div>
                </div>

                {successAlert && (
                    <div className={`alert alert-${alertType}`}>
                        <span className="alert-icon">✓</span>
                        {successAlert}
                        <button 
                            className="close-alert"
                            onClick={() => setSuccessAlert(null)}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Render main view
    if (!isAddingNew && !isEditMode) {
        // Filter packages based on active tab
        const tabFilteredPackages = activeTab === 'all' 
            ? filteredPackages 
            : filteredPackages.filter(pkg => pkg.username && pkg.username.trim() !== '');

        return (
            <div className="packages-management">
                <div className="search-and-add-container">
                    <input
                        type="text"
                        placeholder="Search packages by name or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="action-buttons-container">
                        <button 
                            className="add-package-btn"
                            onClick={() => setIsAddingNew(true)}
                        >
                            <Plus size={20} /> Add Package
                        </button>
                        
                    </div>
                </div>
                
                {/* Render the tabs */}
                <PackageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                
                {/* Display message if no packages are found in the selected tab */}
                {tabFilteredPackages.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">
                            {activeTab === 'all' ? 'No packages found' : 'No custom packages found'}
                        </h3>
                        <p className="empty-state-message">
                            {activeTab === 'all' 
                                ? 'Start by adding your first package.' 
                                : 'No custom packages have been created yet.'}
                        </p>
                        {activeTab === 'all' && (
                            <button 
                                className="empty-state-button"
                                onClick={() => setIsAddingNew(true)}
                            >
                                <Plus size={20} /> Create Package
                            </button>
                        )}
                    </div>
                )}
                
                {/* Display the packages table if we have packages to show */}
                {tabFilteredPackages.length > 0 && (
                    <div className="packages-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Package Name</th>
                                    <th>Event</th>
                                    <th>Tier</th>
                                    <th>{activeTab === 'custom' ? 'Customer' : 'Username'}</th>
                                    <th>Investment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabFilteredPackages.map((pkg) => (
                                    <tr key={pkg.packageId}>
                                        <td>{pkg.packageName}</td>
                                        <td>{pkg.eventName}</td>
                                        <td>{pkg.packageTierName}</td>
                                        <td>{pkg.username || 'Not assigned'}</td>
                                        <td>{formatCurrency(pkg.investedAmount)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="view-btn"
                                                    onClick={() => handleViewPackage(pkg)}
                                                    aria-label="View package"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEditPackage(pkg)}
                                                    aria-label="Edit package"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => openDeleteModal(pkg)}
                                                    aria-label="Delete package"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {successAlert && (
                    <div className={`alert alert-${alertType}`}>
                        <span className="alert-icon">✓</span>
                        {successAlert}
                        <button 
                            className="close-alert"
                            onClick={() => setSuccessAlert(null)}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && packageToDelete && (
                    <div className="delete-modal-overlay">
                        <div className="delete-modal">
                            <div className="delete-modal-header">
                                <h3>Confirm Deletion</h3>
                            </div>
                            <div className="delete-modal-content">
                                <p>Are you sure you want to delete the package <span className="package-name-highlight">"{packageToDelete.packageName}"</span>?</p>
                                <p>This action cannot be undone.</p>
                            </div>
                            <div className="delete-modal-actions">
                                <button
                                    className="cancel-delete-btn"
                                    onClick={closeDeleteModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-delete-btn"
                                    onClick={confirmDelete}
                                >
                                    Delete Package
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render form view (for adding or editing)
    return (
        <div className="packages-management">
            <div className="form-header">
                <button 
                    className="back-btn"
                    onClick={() => {
                        setIsAddingNew(false);
                        setIsEditMode(false);
                        setSelectedPackage(null);
                        setSelectedItems([]);
                        setSelectedDetails([]);
                    }}
                >
                    <ArrowLeft size={20} /> Back to List
                </button>
                <h2>{isEditMode ? 'Edit Package' : 'Add New Package'}</h2>
            </div>

            <form onSubmit={handlePackageSubmit} className="package-form">
                <div className="form-grid">                    <div className="form-group">
                        <label htmlFor="packageName">Package Name</label>
                        <input 
                            type="text" 
                            id="packageName" 
                            name="packageName" 
                            required 
                            defaultValue={isEditMode ? selectedPackage?.packageName : ''}
                        />
                    </div>                    <div className="form-group">
                        <label htmlFor="investedAmount">Investment Amount (LKR)</label>
                        <input 
                            type="number" 
                            id="investedAmount" 
                            name="investedAmount" 
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required 
                            readOnly
                            defaultValue={isEditMode ? selectedPackage?.investedAmount : '0.00'}
                            className="calculated-field"
                        />
                        <small className="form-help-text">Automatically calculated based on selected items and details</small>
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
                            defaultValue={isEditMode ? selectedPackage?.packageTierName : ''}
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
                                        {item.itemType} ({formatCurrency(item.pricePerItem)})
                                    </option>
                            ))}
                        </select>
                    </div>
                    {selectedItems.length > 0 && (
                        <div className="selected-items-list">
                            {selectedItems.map((item) => (
                                <div key={item.itemId} className="selected-item-card">
                                <span className="item-type">{item.itemType}</span>
                                    <div className="item-controls">
                                        <div className="quantity-control">
                                            <button
                                                type="button"
                                                className="quantity-btn"
                                                onClick={() => {
                                                    handleQuantityChange(item.itemId, item.quantity - 1);
                                                }}
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
                                        >
                                            <X size={18} />
                                        </button>
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
                                        {detail.detailDescription} ({formatCurrency(detail.pricePerDetail)})
                                    </option>
                            ))}
                        </select>
                    </div>
                    {selectedDetails.length > 0 && (
                        <div className="selected-details-list">
                            {selectedDetails.map((detail) => (
                                <div key={detail.detailId} className="selected-item-card">
                                    <span className="detail-text">{detail.detailDescription}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedDetail(detail.detailId)}
                                        className="remove-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="button"
                        className="cancel-btn" 
                        onClick={() => {
                            setIsAddingNew(false);
                            setIsEditMode(false);
                            setSelectedPackage(null);
                            setSelectedItems([]);
                            setSelectedDetails([]);
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={formSubmitting}
                    >
                        <Save size={20} /> {isEditMode ? 'Update Package' : 'Save Package'}
                    </button>
                </div>
            </form>

            {successAlert && (
                <div className={`alert alert-${alertType}`}>
                    <span className="alert-icon">✓</span>
                    {successAlert}
                    <button 
                        className="close-alert"
                        onClick={() => setSuccessAlert(null)}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManagePackages;