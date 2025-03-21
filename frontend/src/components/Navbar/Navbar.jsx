import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar = ({ setShowLogin }) => {
    const { token, setToken } = useContext(StoreContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPhotographer, setIsPhotographer] = useState(false);
    const navigate = useNavigate();

    // Function to check user role
    const checkUserRole = () => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setIsAdmin(user.role === 'admin');
                setIsPhotographer(user.role === 'photographer');
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsAdmin(false);
                setIsPhotographer(false);
            }
        } else {
            setIsAdmin(false);
            setIsPhotographer(false);
        }
    };

    // Effect to sync with localStorage token
    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (storedToken && (!token || token !== storedToken)) {
            setToken(storedToken);
        }

        // Check if user is admin or photographer
        checkUserRole();
        
        // Add localStorage event listener to detect changes
        window.addEventListener('storage', checkUserRole);

        return () => {
            window.removeEventListener('storage', checkUserRole);
        };

    }, [setToken, token]);

    // Add another effect that listens specifically for token changes
    useEffect(() => {
        checkUserRole();
    }, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setToken(null);
        setIsAdmin(false);
        setIsPhotographer(false);
        setShowDropdown(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    }

    const handleMenuClick = (route) => {
        navigate(route);
        setShowDropdown(false);
        setIsMobileMenuOpen(false);
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const renderNavLinks = (isMobile = false) => (
        <>
            <Link 
                to="/" 
                className={`nav-link ${isMobile ? 'mobile-nav-link' : ''}`}
                onClick={isMobile ? toggleMobileMenu : undefined}
            >
                Home
            </Link>
            <Link 
                to="/gallery" 
                className={`nav-link ${isMobile ? 'mobile-nav-link' : ''}`}
                onClick={isMobile ? toggleMobileMenu : undefined}
            >
                My Gallery
            </Link>
            <Link 
                to="/booking" 
                className={`nav-link ${isMobile ? 'mobile-nav-link' : ''}`}
                onClick={isMobile ? toggleMobileMenu : undefined}
            >
                Book Now
            </Link>
            <Link 
                to="/about" 
                className={`nav-link ${isMobile ? 'mobile-nav-link' : ''}`}
                onClick={isMobile ? toggleMobileMenu : undefined}
            >
                About Me
            </Link>
            <Link 
                to="/contact" 
                className={`nav-link ${isMobile ? 'mobile-nav-link' : ''}`}
                onClick={isMobile ? toggleMobileMenu : undefined}
            >
                Contact Me
            </Link>
        </>
    );

    // Admin navbar
    if(isAdmin){
        return (
                <div className="navbar admin-navbar">
                    <nav className="navbar-container">
                        <div className="navbar-brand">
                            <img 
                                src={assets.logo} 
                                alt="Logo" 
                                className="navbar-logo"
                                onClick={() => navigate('/userView')}
                            />
                        </div>
                        
                        <div className="admin-logout">
                            <button className="logout-btn" onClick={logout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </nav>
                </div>
            );
    }

    // Admin navbar
    else if(isPhotographer){
        return (
                <div className="navbar admin-navbar">
                    <nav className="navbar-container">
                        <div className="navbar-brand">
                            <img 
                                src={assets.logo} 
                                alt="Logo" 
                                className="navbar-logo"
                                onClick={() => navigate('/userView')}
                            />
                        </div>
                        
                        <div className="admin-logout">
                            <button className="logout-btn" onClick={logout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </nav>
                </div>
            );
    }

    // regular navbar
    else {
        return (
        <div className="navbar">
            <nav className="navbar-container">
                <div className="navbar-brand">
                    <img 
                        src={assets.logo} 
                        alt="Logo" 
                        className="navbar-logo"
                        onClick={() => navigate('/')}
                    />
                    
                    {/* Mobile Menu Toggle */}
                    <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </div>
                </div>

                {/* Desktop Navigation Links */}
                <div className="navbar-links desktop-nav">
                    {renderNavLinks()}
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-nav-links">
                            {renderNavLinks(true)}
                        </div>
                    </div>
                )}

                <div className="navbar-right">
                    {!localStorage.getItem('token') ? (
                        <button 
                            className="signin-btn"
                            onClick={() => setShowLogin(true)}
                        >
                            Sign in
                        </button>
                    ) : (
                        <div 
                            className='navbar-profile'
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <img 
                                src={assets.profile} 
                                alt='profile'
                            />
                            {showDropdown && (
                                <ul className='nav-profile-dropdown'>
                                    <li onClick={() => handleMenuClick('/profile')}>
                                        <img src={assets.profile} alt="profile" />
                                        <p>My Profile</p>
                                    </li>
                                    <li onClick={() => handleMenuClick('/packages')}>
                                        <img src={assets.packageIcon} alt="packages" />
                                        <p>Packages</p>
                                    </li>
                                    <li onClick={() => handleMenuClick('/booking')}>
                                        <img src={assets.bookingIcon} alt="bookings" />
                                        <p>Bookings</p>
                                    </li>
                                    <li onClick={() => handleMenuClick('/events')}>
                                        <img src={assets.eventIcon} alt="events" />
                                        <p>Events</p>
                                    </li>
                                    <hr />
                                    <li onClick={logout}>
                                        <img src={assets.logout} alt="logout" />
                                        <p>Logout</p>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};
}

export default Navbar;