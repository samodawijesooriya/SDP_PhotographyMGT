import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './AddCustomerForm.css';
import { StoreContext } from '../../../context/StoreContext';

const AddCustomerForm = ({ isOpen, onClose, onCustomerAdded }) => {
  const { url } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    fullName: '',
    billingAddress: '',
    email: '',
    billingMobile: '',
    username: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${url}/api/customers/register`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);
      
      if (response.data.success) {
        setSuccess('Customer created successfully!');
        onCustomerAdded(response.data);
        
        // Reset form after successful submission
        setFormData({
          fullName: '',
          billingAddress: '',
          email: '',
          billingMobile: '',
          username: '',
          password: ''
        });
        
        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // The API returned a success: false response
        setError(response.data.message || 'Failed to create customer');
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Customer</h2>
          <div 
            onClick={onClose} 
            className="close-button"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClose();
              }
            }}
          >
            <X size={24} />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Billing Mobile</label>
            <input
              type="tel"
              name="billingMobile"
              value={formData.billingMobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;