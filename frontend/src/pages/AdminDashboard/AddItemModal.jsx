import React, { useState, useContext } from 'react';
import './AddEventModal.css';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const AddItemModal = ({ isOpen, onClose, onItemAdded }) => {
    const { url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        itemType: '',
        itemDescription: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

    
        try {
        
            const response = await axios.post(`${url}/api/packages/pkg/items/create`, formData);
            
            // Reset form
            setFormData({
                itemType: '',
                itemDescription: ''
            });
            
            // Notify parent component about the new item
            onItemAdded(response.data, formData.itemType);
            
            // Close modal
            onClose();
        } catch (err) {
            console.error('Error adding item:', err);
            setError(err.response?.data?.message || 'Failed to add item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                
                
                <form onSubmit={handleSubmit} className="item-form">
                    {error && <div className="form-error">{error}</div>}
                    
                    <button className="close-modal-btn" onClick={onClose} ><X size={24} /> </button>
                    <div className="form-group">
                    <h2>Add New Item</h2>
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemType">Item Type</label>
                        <input 
                            type="text"
                            id="itemType"
                            name="itemType"
                            value={formData.itemType}
                            onChange={handleInputChange}
                            placeholder="Enter item type (e.g., Digital Images, Thank You Cards)"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="itemDescription">Item Description (Optional)</label>
                        <textarea 
                            id="itemDescription"
                            name="itemDescription"
                            value={formData.itemDescription}
                            onChange={handleInputChange}
                            placeholder="Enter item description"
                            rows={3}
                        />
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            <Save size={20} /> 
                            {isSubmitting ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;