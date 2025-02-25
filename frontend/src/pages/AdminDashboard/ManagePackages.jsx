import React, { useState, useEffect } from 'react';
import './ManagePackages.css';
import { X } from 'lucide-react';

const ManagePackages = () => {
    const [packages, setPackages] = useState([]);
    const [events, setEvents] = useState([]);
    const [packageTiers, setPackageTiers] = useState([]);
    const [packageItems, setPackageItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/packages/events");
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

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

    useEffect(() => {
        fetchPackages();
        fetchEvents();
        fetchPackageTiers();
        fetchPackageItems();
    }, []);

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

    const handleQuantityChange = (itemId, quantity) => {
        setSelectedItems(selectedItems.map(item => 
            item.itemId === itemId ? { ...item, quantity: parseInt(quantity) || 0 } : item
        ));
    };

    const removeSelectedItem = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.coverageHours.toString().includes(searchTerm.toLowerCase())
    );

    const handleAddPackage = (e) => {
        e.preventDefault();
        const newPackage = {
            packageName: e.target.packageName.value,
            coverageHours: e.target.coverageHours.value,
            eventName: e.target.eventName.value,
            packageTier: e.target.packageTier.value,
            items: e.target.items.value,
            details: e.target.details.value
        };

        console.log('New Package:', newPackage);
        setIsAddModalOpen(false);
        fetchPackages();
        setSelectedItems([]);
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
                        <h2>Add New Package</h2>
                        <form onSubmit={handleAddPackage}>
                            <div className="form-group">
                                <label htmlFor="packageName">Package Name</label>
                                <input 
                                    type="text" 
                                    id="packageName" 
                                    name="packageName" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="coverageHours">Coverage Hours</label>
                                <input 
                                    type="number" 
                                    id="coverageHours" 
                                    name="coverageHours" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventName">Event Name</label>
                                <select 
                                    id="eventName" 
                                    name="eventName" 
                                    required
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
                            
                            <div className="form-group">
                                <label htmlFor="details">Details</label>
                                <textarea 
                                    id="details" 
                                    name="details" 
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit">Add Package</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePackages;