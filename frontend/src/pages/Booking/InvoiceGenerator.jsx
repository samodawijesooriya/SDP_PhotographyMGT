import React, { useRef, useState, useContext, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoiceGenerator.css';
import { assets } from '../../assets/assets'; 
import { StoreContext } from '../../context/StoreContext';

const InvoiceGenerator = ({ bookingData, invoiceNumber }) => {
  // Use useState instead of React.useState for consistency
  const [packages, setPackages] = useState({});  // Initialize as object, not array
  const [loading, setLoading] = useState(false);
  const { url } = useContext(StoreContext);
  const [error, setError] = useState(null);

  // Create a proper ref with null initialization
  const componentRef = useRef(null);
  
  // Fetch packages data from backend
  const fetchPackages = async () => {
    try {
        setLoading(true);
        
        // Guard clause in case bookingData or packageId is undefined
        if (!bookingData || !bookingData.packageId) {
            throw new Error('Missing booking data or package ID');
        }
        
        const response = await fetch(`${url}/api/packages/${bookingData.packageId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch packages: ${response.status}`);
        }
        
        const data = await response.json();
        
        setPackages(data);
        setError(null);
        console.log('Fetched packages:', data);  // Fixed: removed transformedData reference
    } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Failed to fetch packages. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  // Format date for the invoice
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString || 'N/A';
    }
  };
  
  // Generate current date for invoice creation date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    contentRef: componentRef,  // Changed from content to contentRef
    documentTitle: `Invoice-${invoiceNumber}`,
    onBeforeGetContent: () => {
      // Verify the ref is valid before printing
      if (!componentRef.current) {
        console.error('Print component reference is not available');
        return Promise.reject('Print component reference is not available');
      }
      return Promise.resolve();
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      alert('There was an error printing the invoice. Please try again.');
    }
  });
  
  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!componentRef.current) {
      console.error('Component reference is not available for PDF download');
      alert('Cannot generate PDF. Please try again.');
      return;
    }
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Use html2canvas to convert the invoice to an image
    html2canvas(componentRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save(`Invoice-${invoiceNumber}.pdf`);
    }).catch(error => {
      console.error('PDF generation error:', error);
      alert('There was an error generating the PDF. Please try again.');
    });
  };

  // Update useEffect dependencies to include bookingData.packageId
  useEffect(() => {
    if (bookingData && bookingData.packageId) {
      fetchPackages();
    }
  }, [url, bookingData, bookingData?.packageId]); // Added proper dependencies

  // Show loading state
  if (loading) {
    return <div className="loading-indicator">Loading invoice data...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="invoice-container">
      <div className="invoice-actions">
        <button 
          className="action-button print" 
          onClick={handlePrint}
          disabled={loading}
        >
          <i className="fas fa-print"></i> Print Invoice
        </button>
        <button 
          className="action-button download" 
          onClick={handleDownloadPDF}
          disabled={loading}
        >
          <i className="fas fa-download"></i> Download PDF
        </button>
      </div>
      
      <div className="invoice" ref={componentRef}>
        <div className="invoice-header">
          <div className="logo">
            <img src={assets.logo} alt="Company Logo" />
          </div>
          <div className="invoice-title">
            <h1>INVOICE</h1>
            <div className="invoice-number">#{invoiceNumber || 'N/A'}</div>
          </div>
        </div>
        
        <div className="invoice-info">
          <div className="company-details">
            <h3>FROM</h3>
            <p>Pathum L Weerasighe Photography</p>
            <p>Kegalle, Srilanka</p>
            <p>Email: pathum@photostudio.com</p>
            <p>Tel: + (94) 76 451 8697</p>
          </div>
          
          <div className="customer-details">
            <h3>BILL TO</h3>
            <p>{bookingData?.fullName || 'N/A'}</p>
            <p>{bookingData?.billingAddress || 'N/A'}</p>
            <p>Email: {bookingData?.email || 'N/A'}</p>
            <p>Tel: {bookingData?.billingMobile || 'N/A'}</p>
          </div>
          
          <div className="invoice-dates">
            <div className="date-row">
              <span className="date-label">Invoice Date:</span>
              <span className="date-value">{currentDate}</span>
            </div>
            <div className="date-row">
              <span className="date-label">Event Date:</span>
              <span className="date-value">{formatDate(bookingData?.eventDate)}</span>
            </div>
            <div className="date-row">
              <span className="date-label">Payment Status:</span>
              <span className="date-value status">
                {bookingData?.bookingStatus === 'Confirmed' ? 'PAID' : 
                 bookingData?.bookingStatus === 'Pending' ? 'PARTIALLY PAID' : 
                 'Pencil'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="invoice-details">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Event Type</th>
                <th>Hours</th>
                <th>Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{packages?.packageName || 'N/A'}</td>
                <td>{packages?.eventName || 'N/A'}</td>
                <td>{packages?.coverageHours || 'N/A'}</td>
                <td>{(bookingData?.totalAmount || 0).toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">Subtotal</td>
                <td>{(bookingData?.totalAmount || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan="3">Payment Made</td>
                <td className="payment-made">
                  {bookingData?.bookingStatus === 'Pencil' ? '0' : 
                   bookingData?.bookingStatus === 'Pending' ? '20,000' : 
                   (bookingData?.totalAmount || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="balance-row">
                <td colSpan="3">Balance Due</td>
                <td>
                  {bookingData?.bookingStatus === 'Pencil' ? (bookingData?.totalAmount || 0).toLocaleString() : 
                   bookingData?.bookingStatus === 'Pending' ? ((bookingData?.totalAmount || 0) - 20000).toLocaleString() : 
                   '0.00'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="invoice-footer">
          <div className="terms">
            <h3>Terms & Conditions</h3>
            <p>1. Full payment is due 7 days before the event date.</p>
            <p>2. Cancellations must be made at least 14 days before the event.</p>
            <p>3. Rescheduling is subject to availability.</p>
          </div>
          <div className="thank-you">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;