import { useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './ReceiptUpload.css';
import { Upload, X, Check, AlertTriangle } from 'lucide-react';

const ReceiptUpload = ({ bookingId, onUploadSuccess }) => {
  const { url } = useContext(StoreContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [referenceNo, setReferenceNo] = useState('');
  const [amount, setAmount] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle reference number change
  const handleReferenceChange = (e) => {
    setReferenceNo(e.target.value);
  };
  
  // Handle amount change
  const handleAmountChange = (e) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };
  
  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedFile) {
      setError('Please select a receipt image');
      return;
    }
    
    if (!referenceNo.trim()) {
      setError('Please enter a reference number');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('receiptImage', selectedFile);
      formData.append('referenceNo', referenceNo);
      formData.append('depositAmount', amount);
      
      // Upload receipt
      const depositResponse = await axios.post(
        `${url}/api/payments/bank-deposit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Create payment record
      const paymentResponse = await axios.post(
        `${url}/api/payments`,
        {
          bookingId,
          paymentAmount: amount,
          paymentMethod: 'bankTransfer',
          bankDepositId: depositResponse.data.bankDepositId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSuccess(true);
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setReferenceNo('');
      setAmount('');
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(paymentResponse.data);
      }
      
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setError(err.response?.data?.message || 'Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  return (
    <div className="receipt-upload-container">
      <h3>Upload Bank Transfer Receipt</h3>
      
      {success ? (
        <div className="upload-success">
          <Check size={48} />
          <p>Receipt uploaded successfully!</p>
          <button 
            className="upload-new-button"
            onClick={() => setSuccess(false)}
          >
            Upload Another Receipt
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="receipt-upload-form">
          {error && (
            <div className="upload-error">
              <AlertTriangle size={20} />
              <p>{error}</p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="reference">Reference Number</label>
            <input
              type="text"
              id="reference"
              value={referenceNo}
              onChange={handleReferenceChange}
              placeholder="Enter bank reference number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount (LKR)</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter payment amount"
              required
            />
          </div>
          
          <div className="receipt-upload-area">
            {previewUrl ? (
              <div className="receipt-preview">
                <img src={previewUrl} alt="Receipt preview" />
                <button 
                  type="button" 
                  className="clear-preview" 
                  onClick={clearFile}
                  title="Remove image"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <input
                  type="file"
                  id="receipt"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="receipt" className="file-label">
                  <Upload size={24} />
                  <span>Select Receipt Image</span>
                  <small>JPG, PNG (max 5MB)</small>
                </label>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="upload-button"
            disabled={isUploading || !selectedFile || !referenceNo || !amount}
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReceiptUpload;
