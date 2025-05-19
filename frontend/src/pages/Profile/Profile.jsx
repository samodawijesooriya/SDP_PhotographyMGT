import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import './Profile.css';
import { User, Mail, Lock, Phone, MapPin, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { url } = useContext(StoreContext);
    // Get user from AuthContext with proper variable names
  const { currentUser, isAuthenticated } = useContext(AuthContext) || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // User profile data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    billingAddress: '',
    billingMobile: ''
  });
  // Function to fetch user data from the database
const fetchUserProfile = async () => {
    try {
        setIsLoading(true);
        // Check if userData exists in localStorage
        const userData = localStorage.getItem('userData');
        if (!userData) {
            throw new Error('User data not found in localStorage');
        }
        
        const userId = JSON.parse(userData).id;
        const response = await axios.get(`${url}/api/user/profile/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const fetchedUserData = response.data;
        console.log('User Profile Data:', fetchedUserData);
        // Update profile data with values from the database
        setProfileData({
            fullName: fetchedUserData.fullName || '',
            email: fetchedUserData.email || '',
            billingAddress: fetchedUserData.billingAddress || '',
            billingMobile: fetchedUserData.billingMobile || ''
        });
        
        // Update localStorage directly
        const existingUserData = JSON.parse(localStorage.getItem('userData'));
        const updatedUserData = {
            ...existingUserData,
            ...fetchedUserData
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Trigger storage event so other components know userData has changed
        window.dispatchEvent(new Event('storage'));
        
        setError(null);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again.');
    } finally {
        setIsLoading(false);
    }
};
  // Fetch user data on component mount
  useEffect(() => {
    // Attempt to fetch user data from database immediately on component mount
    fetchUserProfile();
    
    // If we also have user data in context, use it initially
    if (currentUser) {
      setProfileData(prevData => ({
        ...prevData,
        fullName: currentUser.fullName || prevData.fullName,
        email: currentUser.email || prevData.email,
        billingAddress: currentUser.billingAddress || prevData.billingAddress,
        billingMobile: currentUser.billingMobile || prevData.billingMobile
      }));
    }
  }, []); // Empty dependency array means this runs once on mount
  
  // Listen for changes to the user context
  useEffect(() => {
    if (currentUser) {
      setProfileData(prevData => ({
        ...prevData,
        fullName: currentUser.fullName || prevData.fullName,
        email: currentUser.email || prevData.email,
        billingAddress: currentUser.billingAddress || prevData.billingAddress,
        billingMobile: currentUser.billingMobile || prevData.billingMobile
      }));
    }
  }, [currentUser]);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };  // Update profile information
  const updateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Get userId from localStorage
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found in localStorage');
      }
      
      const userId = JSON.parse(userData).id;
      const updatedProfileData = {
        ...profileData,
        userId: userId
      };      
      const response = await axios.put(`${url}/api/user/profile`, updatedProfileData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update localStorage directly
      const existingUserData = JSON.parse(localStorage.getItem('userData'));
      const updatedUserData = {
        ...existingUserData,
        ...profileData
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Trigger storage event so the AuthContext can update
      window.dispatchEvent(new Event('storage'));
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  
  
  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError('');
    setSuccessMessage('');

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Get userId from localStorage for the API request
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('User data not found in localStorage');
      }
      
      const userId = JSON.parse(userData).id;
      
      await axios.put(`${url}/api/user/change-password/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        userId: userId
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Refresh user profile data
  const refreshProfile = async () => {
    try {
      await fetchUserProfile();
      setSuccessMessage('Profile refreshed successfully!');
    } catch (err) {
      setError('Failed to refresh profile. Please try again.');
      console.error('Error refreshing profile:', err);
    }
    setTimeout(() => {
      setSuccessMessage('');
      setError('');
    }, 3000);
  };

  return (
    <div className="profile-container">      
    <div className="profile-header">
        <h1>Your Profile</h1>
        <p>Manage your account information and settings</p>
        <button 
          className="refresh-button" 
          onClick={refreshProfile} 
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Profile'}
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
                Edit
              </button>
            ) : (
              <button className="cancel-button" onClick={() => setIsEditing(false)}>
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="profile-info">
              <div className="info-item">
                <User className="info-icon" />
                <div>
                  <h3>Full Name</h3>
                  <p>{profileData.fullName || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-item">
                <Mail className="info-icon" />
                <div>
                  <h3>Email Address</h3>
                  <p>{profileData.email || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-item">
                <MapPin className="info-icon" />
                <div>
                  <h3>Billing Address</h3>
                  <p>{profileData.billingAddress || "Not set"}</p>
                </div>
              </div>
              
              <div className="info-item">
                <Phone className="info-icon" />
                <div>
                  <h3>Billing Mobile</h3>
                  <p>{profileData.billingMobile || "Not set"}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">
                  <User size={18} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="billingAddress">
                  <MapPin size={18} />
                  Billing Address
                </label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  value={profileData.billingAddress}
                  onChange={handleProfileChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="billingMobile">
                  <Phone size={18} />
                  Billing Mobile
                </label>
                <input
                  type="tel"
                  id="billingMobile"
                  name="billingMobile"
                  value={profileData.billingMobile}
                  onChange={handleProfileChange}
                />
              </div>
              
              <button type="submit" className="save-button" disabled={isLoading}>
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Password</h2>
            {!showPasswordForm ? (
              <button className="edit-button" onClick={() => setShowPasswordForm(true)}>
                <Edit size={16} />
                Change Password
              </button>
            ) : (
              <button className="cancel-button" onClick={() => {
                setShowPasswordForm(false);
                setPasswordError('');
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}>
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          {!showPasswordForm ? (
            <div className="password-info">
              <div className="info-item">
                <Lock className="info-icon" />
                <div>
                  <h3>Password</h3>
                  <p>••••••••</p>
                  <small>For your security, we don't display your password.</small>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={changePassword} className="password-form">
              {passwordError && (
                <div className="password-error">
                  {passwordError}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="currentPassword">
                  <Lock size={18} />
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">
                  <Lock size={18} />
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={18} />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="8"
                />
              </div>
              
              <button type="submit" className="save-button" disabled={isLoading}>
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;