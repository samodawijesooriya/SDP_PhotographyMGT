import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';
import './Payments.css';
import { Eye, Edit, Trash2, Download,  Search,  AlertTriangle, X, DollarSign } from 'lucide-react';

const Payments = () => {
  const { url } = useContext(StoreContext);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewReceiptModal, setViewReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editPaymentModal, setEditPaymentModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setPayments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab changes
  useEffect(() => {
    const fetchTabData = async () => {
      try {
        setIsLoading(true);
        let endpoint = `${url}/api/payments`;
        
        if (activeTab === 'pending') {
          endpoint = `${url}/api/payments/pendingPayment`;
        }
        
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        setPayments(response.data);
        console.log('Payments data:', response.data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${activeTab} payments:`, err);
        setError(`Failed to load ${activeTab} payments data. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTabData();
  }, [activeTab, url]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  // View payment receipt
  const viewReceipt = (payment) => {
    setSelectedPayment(payment);
    setViewReceiptModal(true);
  };

  // Edit payment
  const editPayment = (payment) => {
    setSelectedPayment(payment);
    setEditPaymentModal(true);
  };

  // Delete payment
  const openDeleteConfirm = (payment) => {
    setSelectedPayment(payment);
    setDeleteConfirmModal(true);
  };

  // Handle edit payment form submission
  const handleEditPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${url}/api/payments/${selectedPayment.paymentId}`, selectedPayment, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update payments list
      setPayments(payments.map(payment => 
        payment.paymentId === selectedPayment.paymentId ? response.data : payment
      ));
      
      setEditPaymentModal(false);
      // Optional: Add success toast/notification
    } catch (err) {
      console.error('Error updating payment:', err);
      // Handle error (show error message)
    }
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    try {
      await axios.delete(`${url}/api/payments/${selectedPayment.paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove deleted payment from state
      setPayments(payments.filter(payment => payment.paymentId !== selectedPayment.paymentId));
      
      setDeleteConfirmModal(false);
      // Optional: Add success toast/notification
    } catch (err) {
      console.error('Error deleting payment:', err);
      // Handle error (show error message)
    }
  };

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPayment({
      ...selectedPayment,
      [name]: value
    });
  };

  // Filter payments based on active tab and search query
  const filteredPayments = payments.filter(payment => {
    // First filter by tab
    if (activeTab === 'pending' && payment.status !== 'Pending') return false;
    if (activeTab === 'confirmed' && payment.status !== 'Confirmed') return false;
    if (activeTab === 'rejected' && payment.status !== 'Rejected') return false;
    if (activeTab === 'advances' && !payment.isAdvancePayment) return false;
    if (activeTab === 'refunds' && payment.type !== 'Refund') return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.customerName?.toLowerCase().includes(query) ||
        payment.bookingId?.toString().includes(query) ||
        payment.referenceNumber?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Render payment status with appropriate styling
  const renderStatus = (status) => {
    let statusClass = '';
    
    switch(status?.toLowerCase()) {
      case 'confirmed':
        statusClass = 'status-confirmed';
        break;
      case 'pending':
        statusClass = 'status-pending';
        break;
      case 'rejected':
        statusClass = 'status-rejected';
        break;
      default:
        statusClass = 'status-default';
    }
    
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  // Render payment type
  const renderPaymentType = (type, isAdvance) => {
    let typeClass = '';
    let label = type;
    
    if (type === 'payment') {
      typeClass = isAdvance ? 'type-advance' : 'type-payment';
      label = isAdvance ? 'Advance' : 'Payment';
    } else if (type === 'refund') {
      typeClass = 'type-refund';
    }
    
    return <span className={`type-badge ${typeClass}`}>{label}</span>;
  };

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1>Payment Management</h1>
        <p>Manage all customer payments, advances, and bank transfers</p>
      </div>
      
      <div className="payment-actions">
        <div className="payment-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Payments
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'advances' ? 'active' : ''}`}
            onClick={() => setActiveTab('advances')}
          >
            Advances
          </button>
          <button 
            className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`}
            onClick={() => setActiveTab('refunds')}
          >
            Refunds
          </button>
        </div>
        
        <div className="payment-filters">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by customer name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment data...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertTriangle size={24} />
          <p>{error}</p>
          <button onClick={fetchPayments}>Try Again</button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>No Payments Found</h3>
          <p>There are no payments matching your current filters.</p>
        </div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Booking Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.paymentId} className={payment.status === 'pending' ? 'pending-row' : ''}>
                  <td>{payment.fullName}</td>
                  <td>{payment.bookingId}</td>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td className="amount-cell">{formatCurrency(payment.paymentAmount)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{renderStatus(payment.paymentStatus)}</td>
                  <td className="actions-cell">
                    {payment.paymentMethod === 'bankTransfer' && payment.receiptUrl && (
                      <button 
                        className="view-btn"
                        onClick={() => viewReceipt(payment)}
                        title="View Receipt"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button 
                      className="edit-btn"
                      onClick={() => editPayment(payment)}
                      title="Edit Payment"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => openDeleteConfirm(payment)}
                      title="Delete Payment"
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
      
      {/* Payment Receipt Modal */}
      {viewReceiptModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="receipt-modal">
            <div className="modal-header">
              <h3>Payment Receipt</h3>
              <button className="close-btn" onClick={() => setViewReceiptModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="receipt-details">
              <div className="receipt-info">
                <p><strong>Payment ID:</strong> {selectedPayment.paymentId}</p>
                <p><strong>Customer:</strong> {selectedPayment.customerName}</p>
                <p><strong>Booking ID:</strong> {selectedPayment.bookingId}</p>
                <p><strong>Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                <p><strong>Reference Number:</strong> {selectedPayment.referenceNumber || 'N/A'}</p>
              </div>
              
              <div className="receipt-image-container">
                {selectedPayment.receiptUrl ? (
                  <img 
                    src={`${url}/${selectedPayment.receiptUrl}`} 
                    alt="Payment Receipt" 
                    className="receipt-image"
                  />
                ) : (
                  <div className="no-receipt">
                    <AlertTriangle size={48} />
                    <p>No receipt available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              {selectedPayment.receiptUrl && (
                <a 
                  href={`${url}/${selectedPayment.receiptUrl}`} 
                  download
                  className="download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={16} />
                  Download Receipt
                </a>
              )}
              <button className="close-modal-btn" onClick={() => setViewReceiptModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Payment Modal */}
      {editPaymentModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="edit-payment-modal">
            <div className="modal-header">
              <h4>Edit Payment</h4>
              <button className="close-btn" onClick={() => setEditPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditPayment} className="edit-payment-form">
              <div className="form-group">
                <label htmlFor="fullName">Customer Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={selectedPayment.fullName || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount (LKR)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={selectedPayment.paymentAmount || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
                <input
                  type="datetime-local"
                  id="paymentDate"
                  name="paymentDate"
                  value={selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={selectedPayment.paymentMethod || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="creditCard">Credit Card</option>
                  <option value="bankTransfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentStatus">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={selectedPayment.paymentStatus || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="referenceNumber">Reference Number</label>
                <input
                  type="text"
                  id="referenceNumber"
                  name="referenceNumber"
                  value={selectedPayment.referenceNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAdvancePayment"
                    checked={selectedPayment.isAdvancePayment || false}
                    onChange={(e) => setSelectedPayment({
                      ...selectedPayment,
                      isAdvancePayment: e.target.checked
                    })}
                  />
                  Is Advance Payment
                </label>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h4>Confirm Delete</h4>
              <button className="close-btn" onClick={() => setDeleteConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="confirm-content">
              <AlertTriangle size={48} className="warning-icon" />
              <p>Are you sure you want to delete this payment?</p>
              <p className="payment-info">
                <strong>Customer:</strong> {selectedPayment.fullName}<br />
                <strong>Amount:</strong> {formatCurrency(selectedPayment.paymentAmount)}
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteConfirmModal(false)}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleDeletePayment}>
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Summary Cards */}
      <div className="payment-summary-cards">
        <div className="summary-card">
          <div className="card-icon total-icon">
            
          </div>
          <div className="card-content">
            <h3>Total Payments</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.paymentStatus === 'Confirmed' ? sum + parseFloat(payment.paymentAmount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.type === 'payment').length} payments</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon advance-icon">
          </div>
          <div className="card-content">
            <h3>Advance Payments</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.isAdvancePayment ? sum + parseFloat(payment.amount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.isAdvancePayment).length} payments</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon refund-icon">
          </div>
          <div className="card-content">
            <h3>Refunds</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.paymentStatus === 'refund' ? sum + parseFloat(payment.amount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.type === 'refund').length} refunds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;