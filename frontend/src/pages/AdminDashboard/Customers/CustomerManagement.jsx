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
  const [alertType, setAlertType] = useState("success");

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${url}/api/customers/allcustomers`);
      const data = await response.json();
      setCustomers(data);
      console.log(data);
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

  const handleDeleteCustomer = async (userId) => {
    if (window.confirm('Are you sure you want to delete this Customer?')) {
      try {
        await axios.delete(`${url}/api/customer/${userId}`);
        fetchCustomers();
        showSuccessAlert(`Customer deleted successfully!`, "delete");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEditCustomer = (customers) => {
    setSelectedCustomer(customers);
    setIsEditCustomerFormOpen(true);
  };

  const handleCustomerUpdated = () => {
    fetchCustomers();
    setIsEditCustomerFormOpen(false);
    setSelectedCustomer(null);
    showSuccessAlert(`Customer added successfully!`, "success");
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
                      onClick={() => handleDeleteCustomer(customer.customerId)}
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
      {/* Success Alert Toast */}
      {successAlert && (
        <div className={`success-alert ${alertType}-alert`}>
          <div className="success-alert-content">
            <span className="success-icon">✓</span>
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
  );
};

export default CustomerManagement;
