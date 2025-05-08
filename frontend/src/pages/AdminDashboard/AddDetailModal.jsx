import React, { useState, useContext } from 'react';
import './AddEventModal.css';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const AddDetailModal = ({ isOpen, onClose, onDetailAdded }) => {
    const { url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        detailDescription: '',
        detailCategory: ''
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
            const response = await axios.post(`${url}/api/packages/pkg/details/create`, formData);
            
            // Reset form
            setFormData({
                detailDescription: '',
                detailCategory: ''
            });
            
            // Notify parent component about the new detail
            onDetailAdded(response.data, formData.detailDescription);
            
            // Close modal
            onClose();
        } catch (err) {
            console.error('Error adding detail:', err);
            setError(err.response?.data?.message || 'Failed to add detail. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                
                <form onSubmit={handleSubmit} className="detail-form">
                    {error && <div className="form-error">{error}</div>}
                    
                    <button className="close-modal-btn" onClick={onClose} ><X size={24} /> </button>
                    <div className="form-group">
                    <h2>Add New Detail</h2>
                    </div>

                    <div className="form-group">
                        <label htmlFor="detailDescription">Detail Description</label>
                        <textarea 
                            id="detailDescription"
                            name="detailDescription"
                            value={formData.detailDescription}
                            onChange={handleInputChange}
                            placeholder="Enter detail description (e.g., '10 Hours Event Coverage')"
                            rows={4}
                            required
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
                            {isSubmitting ? 'Saving...' : 'Save Detail'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDetailModal;