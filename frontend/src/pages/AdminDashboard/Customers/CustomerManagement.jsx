import React, { useState, useEffect, useContext } from "react";
import { Search, Edit, Trash2, UserPlus, Mail, Phone } from "lucide-react";
import { StoreContext } from "../../../context/StoreContext";
import axios from "axios";
import "./CustomerManagement.css";
import AddUserForm from "../../AdminView/UserView/AddUserForm";
import EditUserForm from "../../AdminView/UserView/EditUserForm";
import AddCustomerForm from "./AddCustomerForm";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url } = useContext(StoreContext);
  const [isAddCustomerFormOpen, setIsAddCustomerFormOpen] = useState(false);
  const [isEditCustomerFormOpen, setIsEditCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [deleteError, setDeleteError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${url}/api/customers/allcustomers`);
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const showSuccessAlert = (message, type = "success") => {
    setSuccessAlert(message);
    setAlertType(type);
    
    // Auto-hide the alert after 5 seconds
    setTimeout(() => {
      setSuccessAlert(null);
    }, 5000);
  };
  
  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
    setDeleteError(null); // Reset any previous delete errors
  };

  const closeDeleteModal = () => {
    setCustomerToDelete(null);
    setDeleteModalOpen(false);
    setDeleteError(null);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete(`${url}/api/customers/${customerId}`);
      fetchCustomers();
      showSuccessAlert(`Customer deleted successfully!`, "delete");
      closeDeleteModal();
    } catch (err) {
      // Instead of window.alert, show the error in the modal
      setDeleteError(err.response?.data?.message || "This customer cannot be deleted. They may have associated records.");
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditCustomerFormOpen(true);
  };

  const handleCustomerUpdated = () => {
    fetchCustomers();
    setIsEditCustomerFormOpen(false);
    setSelectedCustomer(null);
    showSuccessAlert(`Customer updated successfully!`, "update");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        
        {/* Inline Alert - Placed near the title */}
        {successAlert && (
          <div className={`inline-alert ${alertType}-alert`}>
            <div className="inline-alert-content">
              <span className="alert-icon">✓</span>
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
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && customerToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-content">
              <div className="delete-modal-header">
                <h3>Confirm Deletion</h3>
              </div>
              <p>Are you sure you want to delete <span className="package-name-highlight">{customerToDelete.fullName}</span>?</p>
              <p>This action cannot be undone.</p>
              
              {/* Display error message if delete fails */}
              {deleteError && (
                <div className="delete-error-message">
                  {deleteError}
                </div>
              )}
              
              <div className="delete-modal-actions">
                <button
                  className="cancel-delete-btn"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-btn"
                  onClick={() => handleDeleteCustomer(customerToDelete.customerId)}
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="top-bar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div 
          className="btn-add"
          onClick={() => setIsAddCustomerFormOpen(true)}
        >
          <UserPlus />
          Add New Customer
        </div>
      </div>
      
      <AddCustomerForm
        isOpen={isAddCustomerFormOpen}
        onClose={() => setIsAddCustomerFormOpen(false)}
        onCustomerAdded={() => {
          fetchCustomers();
          setIsAddCustomerFormOpen(false);
          showSuccessAlert("Customer added successfully!", "success");
        }}
      />

      {selectedCustomer && (
        <EditUserForm
          isOpen={isEditCustomerFormOpen}
          onClose={() => {
            setIsEditCustomerFormOpen(false);
            setSelectedCustomer(null);
          }}
          onUserUpdated={handleCustomerUpdated}
          customer={selectedCustomer}
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>FullName</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.customerId}>
                <td>{customer.fullName}</td>
                <td>
                  <div className="contact-info">
                    <span>
                      <Mail size={14} /> {customer.email}
                    </span>
                    <span>
                      <Phone size={14} /> {customer.billingMobile}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="actions">                  
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditCustomer(customer)}>
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => openDeleteModal(customer)}
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
    </div>
  );
};

export default CustomerManagement;