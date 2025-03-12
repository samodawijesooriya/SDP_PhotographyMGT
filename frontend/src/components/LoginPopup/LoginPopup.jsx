import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'


const Login = ({setShowLogin}) => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login")
  const [data, setData] = useState({
    username: "",
    password: "",
    email: "",
    mobile: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prevData => ({...prevData, [name]: value}))
  }

  const toggleState = () => {
    setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")
    // Clear form data when switching states
    setData({
      username: "",
      password: "",
      email: "",
      mobile: ""
    })
  }

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";
      const response = await axios.post(`${url}${endpoint}`, data);
      
      if(response.data.success){
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        
        // Check if user is a photographer
        if(response.data.user.role == 'photographer') {
          setShowLogin(false);
          navigate('/admin-dashboard');
        } else {
          setShowLogin(false);
          navigate('/');
        }
        
        setData({
          username: "",
          password: "",
          email: "",
          mobile: ""
        });
      } else {
        alert(response.data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "An error occurred");
    }
  }


  return (
    <div className='login-popup'>
      <form className='login-popup-container' onSubmit={onLogin}>
        <div className='login-popup-title'>
          <h2>{currState}</h2>
          <img 
            onClick={() => setShowLogin(false)} 
            src={assets.close} 
            alt="close" 
            className="close-icon"
          />
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
            <>
              <input 
                name='email' 
                onChange={onChangeHandler} 
                value={data.email} 
                type='email'
                placeholder='Your Email'  
                required
              />
              <input 
                name='mobile' 
                onChange={onChangeHandler} 
                value={data.mobile} 
                type='tel'
                placeholder='Your Phone Number'  
                required
              />
            </>
          )}
        </div>
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
  )
}

export default Login