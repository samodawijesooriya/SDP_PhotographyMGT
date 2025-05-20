import React, { useState, useEffect, useContext } from 'react';
import './ManageBookings.css';
import { Eye, Trash2, Edit, User, Calendar, Clock, MapPin, Package, CreditCard, Plus } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../../context/StoreContext';

const ManageBookings = () => {
    const { url } = useContext(StoreContext);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [successAlert, setSuccessAlert] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
    const [packages, setPackages] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
      const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        billingMobile: '',
        billingAddress: '',
        eventDate: '',
        eventTime: '',
        venue: '',
        totalAmount: 0,
        paidAmount: 0,
        bookingStatus: '',
        bookingType: '',
        notes: ''
    });    const initialEditFormState = {
        fullName: '',
        email: '',
        billingMobile: '',
        billingAddress: '',
        eventDate: '',
        eventTime: '',
        venue: '',
        totalAmount: 0,
        paidAmount: 0,
        existingPaidAmount: 0,
        bookingStatus: '',
        bookingType: '',
        notes: '',
        packageId: ''
    };

    // Fetch all bookings
    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${url}/api/bookings`);
            const data = await response.json();
            setBookings(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to fetch bookings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all packages
    const fetchPackages = async () => {
        try {
        const response = await axios.get(`${url}/api/packages`);
        setPackages(response.data);
        } catch (error) {
        console.error('Error fetching packages:', error);
        }
    }; 

    const showSuccessAlert = (message, type = 'success') => {
        setSuccessAlert(message);
        setAlertType(type);
        
        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
            setSuccessAlert(null);
        }, 10000);
    };   // Handle form input changes

   const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        
        // If the package dropdown changes, update the total amount based on package price
        if (name === 'packageId' && value) {
          const selectedPackage = packages.find(pkg => pkg.packageId.toString() === value);
          if (selectedPackage) {
            setEditFormData(prev => ({
              ...prev,
              [name]: value,
                totalAmount: selectedPackage.investedAmount,
                packageName: selectedPackage.packageName,
                coverageHours: selectedPackage.coverageHours,
                eventName: selectedPackage.eventName,
            }));
            return;
          }
        }          
        if(name === 'paidAmount') {
            let paidAmount = parseFloat(value) || 0;
            const existingPaidAmount = parseFloat((editFormData.totalAmount - selectedBooking.balanceAmount)) || 0;
            
            // Ensure total of existing + new paid amount doesn't exceed total amount
            editFormData.paidAmount = paidAmount + existingPaidAmount;
            console.log('Paid Amount:', editFormData.paidAmount);
        
            setEditFormData(prev => ({
                ...prev,
                [name]: editFormData.paidAmount,
            }));
        }

        // For all other fields, update normally
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
   };    
   
   const handleEditBooking = (booking, e) => {
    e.stopPropagation();
    
    // Format date for the input field (YYYY-MM-DD)
    const formattedDate = booking.eventDate ? 
        new Date(booking.eventDate).toISOString().split('T')[0] : '';

    // Set the form data with the booking information
    setEditFormData({
        fullName: booking.fullName || '',
        email: booking.email || '',
        billingMobile: booking.billingMobile || '',
        billingAddress: booking.billingAddress || '',
        eventDate: formattedDate,
        eventTime: booking.eventTime || '',
        venue: booking.venue || '',
        totalAmount: booking.investedAmount || booking.totalAmount || 0,
        bookingStatus: booking.bookingStatus || 'Pending',
        bookingType: booking.bookingType || 'Pencil',
        notes: booking.notes || '',
        packageId: booking.packageId || ''
    });
    
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
   };   
   
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let finalSubmitData = {};
            // If the booking is already fully paid
            if (selectedBooking.balanceAmount <= 0.0) { 
                finalSubmitData = {
                    ...editFormData,
                    paidAmount: editFormData.totalAmount
                };
            } else {
                // If there's still a balance to be paid, combine new payment with existing payment
                finalSubmitData = {
                    ...editFormData,
                    paidAmount: parseFloat(editFormData.paidAmount) + parseFloat((editFormData.totalAmount - selectedBooking.balanceAmount))
                };
            }
            console.log('Final Submit Data:', finalSubmitData);

            // Check if we're editing or adding a new booking            
            if (selectedBooking) {
                // Editing existing booking
                await axios.put(`${url}/api/bookings/${selectedBooking.bookingId}`, finalSubmitData);
                console.log('Booking updated:', finalSubmitData);
                showSuccessAlert(`Booking for "${finalSubmitData.fullName}" updated successfully!`, 'update');
            } else {
                // Adding new booking
                console.log('Sending new booking data:', finalSubmitData);
                await axios.post(`${url}/api/bookings`, finalSubmitData);
                showSuccessAlert(`Booking for "${finalSubmitData.fullName}" created successfully!`, 'success');
            }
            
            // Refresh bookings list
            fetchBookings();
            
            // Close the modal and reset form
            setIsEditModalOpen(false);
            setEditFormData(initialEditFormState);
            setSelectedBooking(null);
            
        } catch (error) {
            console.error('Error saving booking:', error);
            showSuccessAlert('Failed to save booking. Please try again.', 'delete');
        }
    };
    const openDeleteModal = (booking) => {
        setBookingToDelete(booking);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setBookingToDelete(null);
        setDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${url}/api/bookings/${bookingToDelete.bookingId}`);
            showSuccessAlert(`Booking "${bookingToDelete.fullName}" deleted successfully!`, 'delete');
            fetchBookings();
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting booking:', error);
            setError('Failed to delete booking. Please try again.');
            closeDeleteModal();
        }
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
    };


    // Calculate the remaining balance
    const calculateRemainingBalance = (totalAmount, paidAmount = 0) => {
        const total = parseFloat(totalAmount) || 0;
        const paid = parseFloat(paidAmount) || 0;
        
        return Math.max(0, total - paid);
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format time
    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(amount);
    };    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pencil':
                return 'status-pencil';
            case 'Pending':
                return 'status-pending';
            case 'Confirmed':
                return 'status-confirmed';
            case 'Completed':
                return 'status-completed';
            case 'Cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    // Function to check if a date is today
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Filter bookings based on active tab
    const getFilteredBookingsByTab = () => {
        let filtered = [...bookings]; // Start with all bookings
        
        // Apply tab filtering
        switch (activeTab) {
            case 'today':
                filtered = filtered.filter(booking => 
                    booking.createdAt && isToday(booking.createdAt)
                );
                break;
            case 'Pencil':
                filtered = filtered.filter(booking => 
                    booking.bookingStatus === 'Pencil'
                );
                break;
            case 'Pending':
                filtered = filtered.filter(booking => 
                    booking.bookingStatus === 'Pending'
                );
                break;
            case 'Confirmed':
                filtered = filtered.filter(booking => 
                    booking.bookingStatus === 'Confirmed'
                );
                break;
            case 'all':
            default:
                // No filtering required for "all"
                break;
        }
        
        // Then apply search term filtering
        return filtered.filter(booking =>
            booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.bookingStatus && booking.bookingStatus.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filteredBookings = getFilteredBookingsByTab();

    // Function to trigger cleanup of outdated pencil bookings
    const triggerPencilBookingsCleanup = async () => {
        try {
        setIsLoading(true);
        const response = await axios.post(`${url}/api/bookings/cleanup`);
        
        const { removedBookings } = response.data;
        
        if (removedBookings > 0) {
            showSuccessAlert(`Removed ${removedBookings} outdated pencil bookings`, 'delete');
        } else {
            showSuccessAlert('No outdated pencil bookings found', 'info');
        }
        
        // Refresh bookings list
        fetchBookings();
        } catch (error) {
        console.error('Error cleaning up pending bookings:', error);
        setError('Failed to clean up pending bookings. Please try again.');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchPackages();
    }, []);

    if (isLoading) {
        return <div className="loading">Loading bookings...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="bookings-management">
            <div className="header-container">
            {/* <button 
            className="cleanup-btn"
            onClick={triggerPencilBookingsCleanup}
            >
            Clean Up Old Pencil Bookings
            </button> */}
        <div className="search-container1">
            <input
                type="text"
                placeholder="Search bookings by name, email, venue or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
        </div>
    </div>

            <div className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                    <span className="tab-badge">{bookings.length}</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    Today
                    <span className="tab-badge">
                        {bookings.filter(booking => booking.createdAt && isToday(booking.createdAt)).length}
                    </span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'Pencil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Pencil')}
                >
                    Pencil
                    <span className="tab-badge">
                        {bookings.filter(booking => booking.bookingStatus === 'Pencil').length}
                    </span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Pending')}
                >
                    Pending
                    <span className="tab-badge">
                        {bookings.filter(booking => booking.bookingStatus === 'Pending').length}
                    </span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'Confirmed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Confirmed')}
                >
                    Confirmed
                    <span className="tab-badge">
                        {bookings.filter(booking => booking.bookingStatus === 'Confirmed').length}
                    </span>
                </button>
    
            </div>

            <div className="table-container">
            <table className="bookings-table">
                <thead>
                <tr>
                    <th>Client</th>
                    <th>Event Date/Venue</th>
                    <th>Package</th>
                    <th>Balance Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                    <tr key={booking.bookingId}>
                        <td className="client-cell">
                        <div className="client-info">
                            <div className="client-name">{booking.fullName}</div>
                        </div>
                        </td>
                        <td className="event-cell">
                        <div className="event-info">
                            <div className="event-date">
                            <Calendar size={14} />
                            {formatDate(booking.eventDate)}
                            </div>
                            <div className="event-venue">
                            {booking.venue}
                            </div>
                        </div>
                        </td>
                        <td className="package-cell">
                        <div className="package-info">
                            <div className="package-name">
                            {booking.packageName || "No package"}
                            </div>
                        </div>
                        </td>
                        <td className="payment-cell">
                        <div className="payment-info">
                            <div className="payment-balance">
                            {formatCurrency(booking.balanceAmount)}
                            </div>
                        </div>
                        </td>
                        <td className="status-cell">
                        <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
                            {booking.bookingStatus || "Unknown"}
                        </span>
                        </td>
                        <td className="actions-cell">                        
                        <button 
                            className="view-btn"
                            onClick={() => handleViewBooking(booking)}
                            aria-label="View booking"
                        >
                            <Eye size={16} />
                        </button>
                        <button 
                            className="edit-btn"
                            onClick={(e) => handleEditBooking(booking, e)}
                            aria-label="Edit booking"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            className="delete-btn"
                            onClick={() => openDeleteModal(booking)}
                            aria-label="Delete booking"
                        >
                            <Trash2 size={16} />
                        </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="6" className="no-bookings">No bookings found</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && !isEditModalOpen && (
                <div className="booking-modal">
                    <div className="booking-modal-content">
                        <button 
                            className="close-button"
                            onClick={() => setSelectedBooking(null)}
                        >
                            ×
                        </button>
                        
                        <h2>Booking Details</h2>
                        
                        <div className="booking-detail-section">
                            <h3><User size={16} /> Client Information</h3>
                            <p><strong>Name:</strong> {selectedBooking.fullName}</p>
                            <p><strong>Email:</strong> {selectedBooking.email}</p>
                            <p><strong>Mobile:</strong> {selectedBooking.billingMobile}</p>
                            <p><strong>Billing Address:</strong> {selectedBooking.billingAddress}</p>
                        </div>
                        
                        <div className="booking-detail-section">
                            <h3><Calendar size={16} /> Event Details</h3>
                            <p><strong>Date:</strong> {formatDate(selectedBooking.eventDate)}</p>
                            <p><strong>Time:</strong> {formatTime(selectedBooking.eventTime)}</p>
                            <p><strong>Venue:</strong> {selectedBooking.venue}</p>
                        </div>
                        
                        <div className="booking-detail-section">
                            <h3><Package size={16} /> Package Details</h3>
                            <p><strong>Package Name:</strong> {selectedBooking.packageName || "Not specified"}</p>
                            <p><strong>Event Type:</strong> {selectedBooking.eventName || "Not specified"}</p>
                            {selectedBooking.coverageHours && (
                                <p><strong>Coverage Hours:</strong> {selectedBooking.coverageHours}</p>
                            )}
                        </div>
                        
                        <div className="booking-detail-section">
                            <h3><CreditCard size={16} /> Payment Details</h3>
                            <p><strong>Total Amount:</strong> {formatCurrency(selectedBooking.investedAmount)}</p>
                            <p><strong>Balance:</strong> {formatCurrency(selectedBooking.balanceAmount)}</p>
                            <p><strong>Booking Status:</strong> 
                                <span className={`status-badge ${getStatusBadgeClass(selectedBooking.bookingStatus)}`}>
                                    {selectedBooking.bookingStatus || "Unknown"}
                                </span>
                            </p>
                        </div>
                        
                        {selectedBooking.notes && (
                            <div className="booking-detail-section">
                                <h3>Additional Notes</h3>
                                <p>{selectedBooking.notes}</p>
                            </div>
                        )}
                        
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close
                            </button>
                            <button 
                                className="edit-btn-large"
                                onClick={(e) => handleEditBooking(selectedBooking, e)}
                            >
                                Edit Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Booking Modal */}
            {isEditModalOpen && (
                <div className="booking-modal">
                    <div className="booking-modal-content edit-modal">
                        <button 
                            className="close-button"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditFormData(initialEditFormState);
                            }}
                        >
                            ×
                        </button>
                        
                        <h2>{selectedBooking ? 'Edit Booking' : 'Create New Booking'}</h2>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="booking-detail-section">
                                <h3><User size={16} /> Client Information</h3>
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="fullName" 
                                        name="fullName"
                                        value={editFormData.fullName}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email"
                                        value={editFormData.email}
                                        readOnly
                                        className="readonly-field"
                                        required
                                    />
                                    <small className="helper-text">Email cannot be edited</small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="billingMobile">Mobile</label>
                                    <input 
                                        type="text" 
                                        id="billingMobile" 
                                        name="billingMobile"
                                        value={editFormData.billingMobile}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="billingAddress">Billing Address</label>
                                    <textarea 
                                        id="billingAddress" 
                                        name="billingAddress"
                                        value={editFormData.billingAddress}
                                        onChange={handleEditFormChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="booking-detail-section">
                                <h3><Calendar size={16} /> Event Details</h3>
                                <div className="form-group">
                                    <label htmlFor="eventDate">Date</label>
                                    <input 
                                        type="date" 
                                        id="eventDate" 
                                        name="eventDate"
                                        value={editFormData.eventDate}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="eventTime">Time</label>
                                    <input 
                                        type="time" 
                                        id="eventTime" 
                                        name="eventTime"
                                        value={editFormData.eventTime}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="venue">Venue</label>
                                    <input 
                                        type="text" 
                                        id="venue" 
                                        name="venue"
                                        value={editFormData.venue}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                <label htmlFor="packageId">Package</label>
                                <select
                                    id="packageId"
                                    name="packageId"
                                    value={editFormData.packageId}
                                    onChange={handleEditFormChange}
                                    required
                                >
                                    <option value="">Select a package</option>
                                    {packages.map(pkg => (
                                    <option key={pkg.packageId} value={pkg.packageId}>
                                        {pkg.packageName} - {pkg.eventName} ({pkg.coverageHours} hours) - {formatCurrency(pkg.investedAmount)}
                                    </option>
                                    ))}
                                </select>
                                </div>
                            </div>
                            
                            <div className="booking-detail-section">
                                <h3><CreditCard size={16} /> Booking Details</h3>                                
                                <div className="form-group">
                                    <label htmlFor="totalAmount">Total Amount (LKR)</label>
                                    <input 
                                        type="number" 
                                        id="totalAmount" 
                                        name="totalAmount"
                                        value={editFormData.totalAmount}
                                        disabled
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <small className="helper-text">Based on selected package</small>
                                </div>
                                                              
                                {/* Only show payment input if there's a balance to be paid */}
                                {(selectedBooking.balanceAmount === 0.0) ? (
                                    <div className="form-group">
                                        <label htmlFor="paidAmount">Balance Payment (LKR)</label>
                                        <input 
                                            type="number" 
                                            id="paidAmount" 
                                            name="paidAmount"
                                            value={editFormData.paidAmount}
                                            onChange={handleEditFormChange}
                                            min="0"
                                            step="0.01"
                                            max={editFormData.totalAmount}
                                            required
                                        />
                                        <small className="helper-text">Existing paid amount: {formatCurrency(editFormData.totalAmount - selectedBooking.balanceAmount)}</small>
                                    </div> 
                                ) : (
                                    <div className="form-group">
                                        <div className="payment-status-notice">
                                            <span className="paid-badge"> <strong> Fully Paid </strong></span>
                                            <small> No additional payment required</small>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="form-group">
                                    <label>Remaining Balance</label>
                                    <div className="balance-display">
                                    {formatCurrency(calculateRemainingBalance(editFormData.totalAmount, parseFloat(editFormData.totalAmount - selectedBooking.balanceAmount)))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bookingStatus">Booking Status</label>
                                    <select 
                                        id="bookingStatus" 
                                        name="bookingStatus"
                                        value={editFormData.bookingStatus}
                                        onChange={handleEditFormChange}
                                        required
                                    >                                   
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="booking-detail-section">
                                <h3>Additional Notes</h3>
                                <div className="form-group">
                                    <textarea 
                                        id="notes" 
                                        name="notes"
                                        value={editFormData.notes}
                                        onChange={handleEditFormChange}
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditFormData(initialEditFormState);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="save-btn"
                                >
                                    {selectedBooking ? 'Save Changes' : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Alert */}
            {successAlert && (
                <div className="success-alert">
                    <div className={`success-alert-content alert-${alertType}`}>
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

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && bookingToDelete && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <div className="delete-modal-header">
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="delete-modal-content">
                            <p>Are you sure you want to delete this booking</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button
                                className="cancel-delete-btn"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete-btn"
                                onClick={confirmDelete}
                            >
                                Delete Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
};

export default ManageBookings;