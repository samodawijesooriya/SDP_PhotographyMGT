import { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';
import './Payments.css';
import { Eye, Check, X, Download, RefreshCw, Filter, Search, DollarSign, AlertTriangle } from 'lucide-react';
import ReceiptUpload from '../../../components/ReceiptUpload/ReceiptUpload';
import '../../../components/ReceiptUpload/ReceiptUpload.css';

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
  const [isConfirming, setIsConfirming] = useState(false);


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
  // Handle payment verification
  const handleVerifyPayment = async (paymentId, isApproved) => {
    try {
      setIsConfirming(true);
      
      const response = await axios.post(
        `${url}/api/payments/verify/${paymentId}`,
        { status: isApproved ? 'confirmed' : 'rejected' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the payment status in the frontend
      setPayments(payments.map(payment => 
        payment.paymentId === paymentId 
          ? { ...payment, status: isApproved ? 'confirmed' : 'rejected' } 
          : payment
      ));
      
      // Close the modal
      setViewReceiptModal(false);
      setSelectedPayment(null);
      
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // View payment receipt
  const viewReceipt = (payment) => {
    setSelectedPayment(payment);
    setViewReceiptModal(true);
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
    
    switch(status.toLowerCase()) {
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
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Verification
          </button>
          <button 
            className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmed
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
          
          <button className="refresh-btn" onClick={fetchPayments}>
            <RefreshCw size={16} />
            Refresh
          </button>
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
                  <td className="amount-cell">{formatCurrency(payment.amount)}</td>
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
                    {payment.paymentStatus === 'pending' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleVerifyPayment(payment.paymentId, true)}
                          title="Approve Payment"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleVerifyPayment(payment.paymentId, false)}
                          title="Reject Payment"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
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
            
            {selectedPayment.status === 'pending' && (
              <div className="verification-actions">
                <p className="verification-note">Please verify this bank transfer receipt before confirming the payment.</p>
                <div className="action-buttons">
                  <button 
                    className="confirm-btn"
                    onClick={() => handleVerifyPayment(selectedPayment.paymentId, true)}
                    disabled={isConfirming}
                  >
                    {isConfirming ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  <button 
                    className="reject-btn full-width"
                    onClick={() => handleVerifyPayment(selectedPayment.paymentId, false)}
                    disabled={isConfirming}
                  >
                    {isConfirming ? 'Processing...' : 'Reject Payment'}
                  </button>
                </div>
              </div>
            )}
            
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
      
      {/* Dashboard Summary Cards */}
      <div className="payment-summary-cards">
        <div className="summary-card">
          <div className="card-icon total-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Total Payments</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.type === 'payment' ? sum + parseFloat(payment.amount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.type === 'payment').length} payments</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon pending-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="card-content">
            <h3>Pending Verification</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.status === 'pending' ? sum + parseFloat(payment.amount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.status === 'pending').length} payments</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon advance-icon">
            <DollarSign size={24} />
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
            <RefreshCw size={24} />
          </div>
          <div className="card-content">
            <h3>Refunds</h3>
            <p className="amount">{formatCurrency(payments.reduce((sum, payment) => 
              payment.type === 'refund' ? sum + parseFloat(payment.amount) : sum, 0))}</p>
            <p className="count">{payments.filter(p => p.type === 'refund').length} refunds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;