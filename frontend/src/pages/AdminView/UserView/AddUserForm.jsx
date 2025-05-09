import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './AddUserForm.css';
import { StoreContext } from '../../../context/StoreContext';

const AddUserForm = ({ isOpen, onClose, onUserAdded }) => {
  const { url } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
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

    try {
      const response = await axios.post(`${url}/api/user/create`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Token:', response.data.token);
      console.log('Success message:', 'User created successfully!');
      onUserAdded(response.data); // Changed from data to response.data
      

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
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
          <h2 style={{ color: 'black' }}>Add New User</h2>
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
        {success && <div className="success-message">{success}</div>}


        <form onSubmit={handleSubmit} className="add-user-form">
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
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="customer">customer</option>
              <option value="photographer">photographer</option>
              <option value="admin">admin</option>
            </select>
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
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default AddUserForm;