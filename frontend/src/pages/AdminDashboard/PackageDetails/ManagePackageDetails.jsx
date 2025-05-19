import React, { useState, useEffect, useContext } from 'react';
import './ManagePackageDetails.css';
import { Trash2, Edit, Plus, X, Save, FileText, Info } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const ManagePackageDetails = () => {
  const { url } = useContext(StoreContext);
  const [packageDetails, setPackageDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [formData, setFormData] = useState({
    detailDescription: '',
    detailId: '',
    pricePerDetail: ''
  });

  // Fetch all package details
  useEffect(() => {
    fetchPackageDetails();
  }, [url]);

  const fetchPackageDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/packages/pkg/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPackageDetails(response.data);
      console.log('Package Details:', response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching package details:', err);
      setError('Failed to load package details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validation for pricePerDetail
    if (name === 'pricePerDetail') {
      // Allow only non-negative numbers
      if (value === '' || (parseFloat(value) >= 0)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Add new detail
  const handleAddDetail = async (e) => {
    e.preventDefault();
    try {
        console.log('Form Data:', formData);
      await axios.post(`${url}/api/packages/pkg/details`, formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsAddMode(false);
      setFormData({
        detailDescription: '',
        pricePerDetail: ''
      });
      fetchPackageDetails();
    } catch (err) {
      console.error('Error adding package detail:', err);
      setError('Failed to add package detail. Please try again.');
    }
  };

  // Edit detail
  const handleEditDetail = async (e) => {
    e.preventDefault();
    try {
      
      // addd the selectedDetail.detailId to the formData
      const updatedFormData = {
        ...formData,
        detailId: selectedDetail.detailId
      };
      console.log('Form Data:', updatedFormData);
      await axios.put(`${url}/api/packages/pkg/details/${selectedDetail.detailId}`, updatedFormData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEditMode(false);
      setSelectedDetail(null);
      fetchPackageDetails();
    } catch (err) {
      console.error('Error updating package detail:', err);
      setError('Failed to update package detail. Please try again.');
    }
  };

  // Delete detail
  const handleDeleteDetail = async (detailId) => {
    if (window.confirm('Are you sure you want to delete this detail?')) {
      try {
        await axios.delete(`${url}/api/packages/details/${detailId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchPackageDetails();
      } catch (err) {
        console.error('Error deleting package detail:', err);
        setError('Failed to delete package detail. Please try again.');
      }
    }
  };
  // Start editing
  const startEditing = (detail) => {
    setSelectedDetail(detail);
    setFormData({
      detailDescription: detail.detailDescription,
      pricePerDetail: detail.pricePerDetail
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };
  // Filter details by search term
  const filteredDetails = packageDetails.filter(detail => 
    detail.detailDescription && detail.detailDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-package-details">
      <div className="details-header">
        <h3>Package Details Management</h3>
        <p>Manage additional details that can be included in packages</p>
      </div>

      <div className="details-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="add-detail-btn"          
          onClick={() => {
            setIsAddMode(true);
            setIsEditMode(false);
            setFormData({
              detailDescription: '',
              pricePerDetail: '',
              isActive: true
            });
          }}
        >
          <Plus size={16} /> Add New Detail
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading details...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {(isAddMode || isEditMode) && (
            <div className="detail-form-container">              <form onSubmit={isAddMode ? handleAddDetail : handleEditDetail} className="detail-form">
                <h4>{isAddMode ? 'Add New Detail' : 'Edit Detail'}</h4>
                <div className="form-group">
                  <label>Detail Description:</label>
                  <input
                    type="text"
                    name="detailDescription"
                    value={formData.detailDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price Per Detail</label>
                  <input
                    type="number"
                    name="pricePerDetail"
                    value={formData.pricePerDetail}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter price amount"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsAddMode(false);
                      setIsEditMode(false);
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <Save size={16} /> {isAddMode ? 'Add Detail' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {filteredDetails.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No Details Found</h3>
              <p>There are no package details matching your search criteria.</p>
            </div>
          ) : (
            <div className="details-table-container">
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Detail Description</th>
                    <th>Price Per Detail</th>
                    <th>Actions</th>
                  </tr>
                </thead>                
                <tbody>
                  {filteredDetails.map((detail) => (
                    <tr key={detail.detailId}>
                      <td>{detail.detailDescription}</td>
                      <td>{detail.pricePerDetail}</td>
                      <td>
                        <div className="actions">
                          <button 
                            className="edit-btn"
                            onClick={() => startEditing(detail)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteDetail(detail.detailId)}
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
        </>
      )}
    </div>
  );
};

export default ManagePackageDetails;
