import React, { useState, useContext } from 'react';
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
    email: "",
  });
  const [error, setError] = useState("");

  // Get the previous path from state if available
  const from = location.state?.from?.pathname || "/";

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prevData => ({...prevData, [name]: value}));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const toggleState = () => {
    setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
    // Clear form data and errors when switching states
    setData({
      username: "",
      password: "",
      email: "",
    });
    setError("");
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";
      const response = await axios.post(`${url}${endpoint}`, data);
      
      if(response.data.success){
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        
        // Dispatch storage event for other components to detect login
        window.dispatchEvent(new Event('storage'));
        
        setData({
          username: "",
          password: "",
          email: "",
        });

        // Close login popup if in popup mode
        if (setShowLogin) {
          setShowLogin(false);
        }

        // Navigate based on user role and context
        if (location.pathname === '/booking') {
          // Stay on booking page but refresh to update data
          window.location.reload();
        } else if (response.data.user.role === 'photographer') {
          navigate('/admin-dashboard');
        } else if (response.data.user.role === 'admin') {
          navigate('/userView');
        } else {
          // Navigate to the page they were trying to access or home
          navigate(from);
        }
      } else {
        setError(response.data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred during authentication");
    }
  };

  // Determine if component is being used as a page or popup
  const isPage = !setShowLogin;

  return (
    <div className={isPage ? 'login-page' : 'login-popup'}>
      <form className='login-popup-container' onSubmit={onLogin}>
        <div className='login-popup-title'>
          <h2>{currState}</h2>
          {!isPage && (
            <img 
              onClick={() => setShowLogin(false)} 
              src={assets.close} 
              alt="close" 
              className="close-icon"
            />
          )}
        </div>   
        
        <div className='login-popup-inputs'>
          <input 
            name='username' 
            onChange={onChangeHandler} 
            value={data.username}
            type='text' 
            placeholder='Your Username' 
            required
          />
          <input 
            name='password' 
            onChange={onChangeHandler} 
            value={data.password} 
            type='password'
            placeholder='Your Password' 
            required 
          />
          {currState !== "Login" && (
            <input 
              name='email' 
              onChange={onChangeHandler} 
              value={data.email} 
              type='email'
              placeholder='Your Email'  
              required
            />
          )}
        </div>
        
        {error && (
          <label className='error-message'>{error}</label>
        )}
        
        <button type="submit">
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
      </form>
    </div>
  );
};

export default Login;