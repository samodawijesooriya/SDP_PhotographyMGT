import React, { useState, useContext, use } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = ({setShowLogin}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
    address: "",
    mobile: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get the previous path from state if available
  const from = location.state?.from?.pathname || "/";

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    
    // Perform real-time validation for certain fields
    if (name === 'name' && currState === 'Sign Up') {
      // Only allow letters and spaces in the name field
      if (value && !/^[A-Za-z\s]*$/.test(value)) {
        setError("Full name should only contain letters and spaces");
        return;
      }
    }
    
    if (name === 'username') {
      // Only allow alphanumeric characters
      if (value && !/^[A-Za-z0-9]*$/.test(value)) {
        setError("Username should only contain letters and numbers");
        return;
      }
    }
    
    if (name === 'password' && currState === 'Sign Up' && value.length > 0 && value.length < 5) {
      setError("Password must be at least 5 characters long");
    } else if (name === 'confirmPassword' && data.password !== value) {
      setError("Passwords do not match");
    } else {
      // Clear error when user corrects the input
      setError("");
    }
    
    setData(prevData => ({...prevData, [name]: value}));
  };

  const toggleState = () => {
    setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
    // Clear form data and errors when switching states
    setData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      address: "",
      mobile: "",
    });
    setError("");
    setSuccess("");
    setShowVerification(false);
  };

  const validateForm = () => {
    if (currState === "Sign Up") {
      // Full name validation (no numbers or special characters)
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(data.name)) {
        setError("Full name should only contain letters and spaces");
        return false;
      }
      
      // Username validation (alphanumeric only)
      const usernameRegex = /^[A-Za-z0-9]+$/;
      if (!usernameRegex.test(data.username)) {
        setError("Username should only contain letters and numbers");
        return false;
      }
      
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      
      // Mobile validation (allow common formats)
      const mobileRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{4,6}$/;
      if (!mobileRegex.test(data.mobile)) {
        setError("Please enter a valid mobile number");
        return false;
      }
      
      // Password minimum length
      if (data.password.length < 5) {
        setError("Password must be at least 5 characters long");
        return false;
      }
      
      // Password and confirm password match
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    } else {
      // Login validation - just check if username is alphanumeric
      const usernameRegex = /^[A-Za-z0-9]+$/;
      if (!usernameRegex.test(data.username)) {
        setError("Username should only contain letters and numbers");
        return false;
      }
    }
    return true;
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Start countdown timer for resend OTP button
  const startResendTimer = () => {
    setResendDisabled(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP function
  const resendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${url}/api/user/resend-otp`, { email: verificationEmail });
      if (response.data.success) {
        setSuccess("OTP has been resent to your email");
        startResendTimer();
      } else {
        setError(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred while resending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${url}/api/user/verify-email`, { 
        email: verificationEmail, 
        otp: otp 
      });
      
      if (response.data.success) {
        setSuccess("Email verified successfully!");
        setShowVerification(false);
        
        // If login tokens are provided after verification
        if (response.data.token) {
          console.log("Token:", response.data.user);
          localStorage.setItem("userData", JSON.stringify(response.data.user));
          
          // Dispatch storage event for other components to detect login
          window.dispatchEvent(new Event('storage'));
          
          // Navigate based on user role and context
          if (location.pathname === '/booking') {
            window.location.reload();
          } else if (response.data.user.role === 'photographer') {
            navigate('/admin-dashboard');
          } else if (response.data.user.role === 'admin') {
            navigate('/userView');
          } else {
            navigate(from);
          }
          
          // Close login popup if in popup mode
          if (setShowLogin) {
            setShowLogin(false);
          }
        } else {
          // If no token, prompt them to login
          setCurrState("Login");
          setSuccess("Account created! Please login with your credentials");
        }
      } else {
        setError(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      setError("");
      setSuccess("");
      setIsLoading(true);
      
      if (currState === "Login") {
        // Login process
        const response = await axios.post(`${url}/api/user/login`, {
          username: data.username,
          password: data.password
        });

        console.log("Login response:", response.data);
        
        if (response.data.success) {
          // If email is not verified
          if (response.data.emailVerificationRequired) {
            setVerificationEmail(response.data.email);
            setShowVerification(true);
            setSuccess("OTP has been sent to your email");
            startResendTimer();
          } else {
            // Normal login
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userData", JSON.stringify(response.data.user));
            
            // Dispatch storage event for other components to detect login
            window.dispatchEvent(new Event('storage'));
            
            // Close login popup if in popup mode
            if (setShowLogin) {
              setShowLogin(false);
            }

            // Navigate based on user role and context
            if (location.pathname === '/booking') {
              window.location.reload();
            } else if (response.data.user.role === 'photographer') {
              navigate('/admin-dashboard');
            } else if (response.data.user.role === 'admin') {
              navigate('/userView');
            } else {
              navigate(from);
            }
          }
        } else {
          setError(response.data.message || "An error occurred");
        }
      } else {
        // Sign up process
        const submitData = {...data};
        delete submitData.confirmPassword;
        
        const response = await axios.post(`${url}/api/user/create`, submitData);
        
        if (response.data.success) {
          setVerificationEmail(data.email);
          setShowVerification(true);
          setSuccess("Registration successful! Please verify your email with the OTP sent");
          startResendTimer();
        } else {
          setError(response.data.message || "An error occurred");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if component is being used as a page or popup
  const isPage = !setShowLogin;

  // Spinner component
  const Spinner = () => (
    <div className="spinner-overlay">
      <div className="spinner"></div>
      <p>Sending verification email...</p>
    </div>
  );

  return (
    <div className={isPage ? 'login-page' : 'login-popup'}>
      {isLoading && <Spinner />}
      <form className='login-popup-container' onSubmit={showVerification ? verifyOtp : onLogin}>
        <div className='login-popup-title'>
          <h2>{showVerification ? "Email Verification" : currState}</h2>
          {!isPage && (
            <img 
              onClick={() => setShowLogin(false)} 
              src={assets.close} 
              alt="close" 
              className="close-icon"
            />
          )}
        </div>   
        
        {/* Success Message */}
        {success && (
          <div className='success-message'>{success}</div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className='error-message login'>{error}</div>
        )}
        
        {showVerification ? (
          // Email Verification Form
          <div className='login-popup-inputs'>
            <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
              Please enter the OTP sent to <strong>{verificationEmail}</strong>
            </p>
            <input
              name='otp'
              onChange={handleOtpChange}
              value={otp}
              type='text'
              placeholder='Enter OTP'
              required
            />
            <button type="submit" disabled={isLoading}>Verify Email</button>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '1rem',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendDisabled || isLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: (resendDisabled || isLoading) ? '#999' : '#333',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: (resendDisabled || isLoading) ? 'not-allowed' : 'pointer',
                  padding: '0',
                  fontSize: '0.9rem'
                }}
              >
                {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setCurrState("Login");
                }}
                disabled={isLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: isLoading ? '#999' : '#333',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  padding: '0.5rem 0',
                  fontSize: '0.9rem'
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          // Login/Sign Up Forms
          <>
            <div className='login-popup-inputs'>
              {currState === "Login" ? (
                <>
                  <input 
                    name='username' 
                    onChange={onChangeHandler} 
                    value={data.username}
                    type='text' 
                    placeholder='Your Username' 
                    required
                    className={error && error.includes("Username") ? 'input-error' : ''}
                  />
                  <input 
                    name='password' 
                    onChange={onChangeHandler} 
                    value={data.password} 
                    type='password'
                    placeholder='Your Password' 
                    required 
                  />
                </>
              ) : (
                <>
                  <input 
                    name='name' 
                    onChange={onChangeHandler} 
                    value={data.name} 
                    type='text'
                    placeholder='Your Full Name'  
                    required
                    className={error && error.includes("Full name") ? 'input-error' : ''}
                    title="Full name should only contain letters and spaces"
                  />
                  <input 
                    name='username' 
                    onChange={onChangeHandler} 
                    value={data.username}
                    type='text' 
                    placeholder='Your Username' 
                    required
                    className={error && error.includes("Username") ? 'input-error' : ''}
                    title="Username should only contain letters and numbers"
                  />
                  <input 
                    name='password' 
                    onChange={onChangeHandler} 
                    value={data.password} 
                    type='password'
                    placeholder='Your Password (min 5 characters)'
                    required 
                    className={error && error.includes("at least 5 characters") ? 'input-error' : ''}
                    minLength="5"
                  />
                  <input 
                    name='confirmPassword' 
                    onChange={onChangeHandler} 
                    value={data.confirmPassword} 
                    type='password'
                    placeholder='Confirm Password' 
                    required 
                    className={error && error.includes("Passwords do not match") ? 'input-error' : ''}
                  />                  
                  <input 
                    name='email' 
                    onChange={onChangeHandler} 
                    value={data.email} 
                    type='email'
                    placeholder='Your Email'  
                    required
                    className={error && error.includes("email") ? 'input-error' : ''}
                    title="Please enter a valid email address"
                  />
                  <input 
                    name='mobile' 
                    onChange={onChangeHandler} 
                    value={data.mobile} 
                    type='tel'
                    placeholder='Your Mobile Number'
                    required
                    className={error && error.includes("mobile") ? 'input-error' : ''}
                    title="Please enter a valid mobile number"
                  />
                  <input 
                    name='address' 
                    onChange={onChangeHandler} 
                    value={data.address} 
                    type='text'
                    placeholder='Your Address'  
                    required
                  />
                </>
              )}
            </div>
          
            <button type="submit" disabled={isLoading}>
              {currState === "Login" ? "Login" : "Create account"}
            </button>

            <p style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              {currState === "Login" 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <span 
                onClick={toggleState}
                style={{
                  color: '#333',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {currState === "Login" ? "Sign Up" : "Login"}
              </span>
            </p>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;