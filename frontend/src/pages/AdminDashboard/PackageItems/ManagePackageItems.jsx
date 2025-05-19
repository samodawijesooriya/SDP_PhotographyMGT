import React, { useState, useEffect, useContext } from 'react';
import './ManagePackageItems.css';
import { Trash2, Edit, Plus, X, Save, Database } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const ManagePackageItems = () => {
  const { url } = useContext(StoreContext);
  const [packageItems, setPackageItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    itemType: '',
    description: '',
    pricePerItem: 0,
  });

  // Fetch all package items
  useEffect(() => {
    fetchPackageItems();
  }, [url]);

  const fetchPackageItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/packages/pkg/items`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPackageItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching package items:', err);
      setError('Failed to load package items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      console.log('Form Data:', formData);
      await axios.post(`${url}/api/packages/items`, formData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsAddMode(false);
      setFormData({
        itemType: '',
        pricePerItem: 0
      });
      fetchPackageItems();
    } catch (err) {
      console.error('Error adding package item:', err);
      setError('Failed to add package item. Please try again.');
    }
  };

  // Edit item
  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const updatedFormData = {
        ...formData,
        itemId: selectedItem.itemId
      };
      console.log('Updated Form Data:', updatedFormData);
      await axios.put(`${url}/api/packages/pkg/items/${selectedItem.itemId}`, updatedFormData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEditMode(false);
      setSelectedItem(null);
      fetchPackageItems();
    } catch (err) {
      console.error('Error updating package item:', err);
      setError('Failed to update package item. Please try again.');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${url}/api/packages/items/${itemId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchPackageItems();
      } catch (err) {
        console.error('Error deleting package item:', err);
        setError('Failed to delete package item. Please try again.');
      }
    }
  };

  // Start editing
  const startEditing = (item) => {
    setSelectedItem(item);
    setFormData({
      itemType: item.itemType,
      pricePerItem: item.pricePerItem
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  // Filter items by search term
  const filteredItems = packageItems.filter(item => 
    item.itemType.toLowerCase().includes(searchTerm.toLowerCase())  );

  return (
    <div className="manage-package-items">
      <div className="items-header">
        <h3>Package Items Management</h3>
        <p>Manage individual items that can be included in packages</p>
      </div>

      <div className="items-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="add-item-btn"
          onClick={() => {
            setIsAddMode(true);
            setIsEditMode(false);
            setFormData({
              itemType: '',
              description: '',
              pricePerItem: 0
            });
          }}
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading items...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {(isAddMode || isEditMode) && (
            <div className="item-form-container">
              <form onSubmit={isAddMode ? handleAddItem : handleEditItem} className="item-form">
                <h4>{isAddMode ? 'Add New Item' : 'Edit Item'}</h4>
                
                <div className="form-group">
                  <label>Item Type:</label>
                  <input
                    type="text"
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Price Per Item (LKR):</label>
                  <input
                    type="number"
                    name="pricePerItem"
                    value={formData.pricePerItem}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
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
                    <Save size={16} /> {isAddMode ? 'Add Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Database size={48} />
              <h3>No Items Found</h3>
              <p>There are no package items matching your search criteria.</p>
            </div>
          ) : (
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item Type</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.itemId}>
                      <td>{item.itemType}</td>
                      <td>{formatCurrency(item.pricePerItem)}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => startEditing(item)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteItem(item.itemId)}
                        >
                          <Trash2 size={16} />
                        </button>
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

export default ManagePackageItems;
