import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Pathum L Weerasinghe Photography</h3>
          <p>Capturing your most precious moments with artistic vision and heartfelt passion.</p>
          <div className="social-icons">
            <a href="https://www.instagram.com/_.pathumaa._?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-icon" target='blank'><Instagram size={24} /></a>
            <a href="https://www.facebook.com/profile.php?id=100084296241929" className="social-icon" target='blank'><Facebook size={24} /></a>
            <a href="#" className="social-icon"><Twitter size={24} /></a>
          </div>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <div className="contact-item">
            <Mail size={20} />
            <span>pethumlakmal6@gmail.com</span>
          </div>
          <div className="contact-item">
            <Phone size={20} />
            <span>+94 76 451 8697</span>
          </div>
          <div className="contact-item">
            <MapPin size={20} />
            <span>Kegalle, Sri Lanka</span>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Portfolio</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for latest updates</p>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Pathum L Weerasinghe Photography. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;