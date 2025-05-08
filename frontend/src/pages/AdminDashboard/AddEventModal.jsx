import React, { useState, useContext } from 'react';
import './AddEventModal.css';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const AddEventModal = ({ isOpen, onClose, onEventAdded }) => {
    const { url } = useContext(StoreContext);
    const [formData, setFormData] = useState({
        eventName: '',
        description: ''
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
            const response = await axios.post(`${url}/api/packages/pkg/events/create`, formData);
            
            // Reset form
            setFormData({
                eventName: '',
                description: ''
            });
            
            // Notify parent component about the new event
            onEventAdded(response.data, formData.eventName);
            
            // Close modal
            onClose();
        } catch (err) {
            console.error('Error adding event:', err);
            setError(err.response?.data?.message || 'Failed to add event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                
                <form onSubmit={handleSubmit} className="event-form">
                    {error && <div className="form-error">{error}</div>}
                    <button 
                        className="close-modal-btn"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>

                    <div className="form-group">
                    <h2>Add New Event</h2>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="eventName">Event Name</label>
                        <input 
                            type="text"
                            id="eventName"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            placeholder="Enter event name"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Event Description (Optional)</label>
                        <textarea 
                            id="description"
                            name="eventDescription"
                            value={formData.eventDescription}
                            onChange={handleInputChange}
                            placeholder="Enter event description"
                            rows={4}
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
                            {isSubmitting ? 'Saving...' : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;