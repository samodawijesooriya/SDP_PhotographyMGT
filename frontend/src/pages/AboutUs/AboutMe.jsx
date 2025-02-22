import React from 'react';
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import './AboutMe.css';
import { assets } from '../../assets/assets';

const AboutMe = () => {
  return (
    <div className="about-container">
      <div className="background-pattern"></div>
      
      <div className="content-wrapper">
        <div className="header-section">
          <h1 className="main-title">About Me</h1>
          <div className="title-underline"></div>
        </div>

        <div className="about-grid">
          {/* Image Section */}
          <div className="image-section">
            <div className="image-container">
              <img src={assets.me01} alt="Professional photographer" className="about-image" />
              <div className="image-overlay"></div>
            </div>
          </div>

          {/* Text Content Section */}
          <div className="text-section">
            <div className="text-content">
              <p className="highlight-text">
                Capturing life's precious moments through the lens for over 6 years in Sri Lanka
              </p>

              <div className="paragraphs">
                <p>
                  I've been very fortunate to have been a full-time wedding photographer in Sri Lanka for the last 6 years. I began 
                  photography as a hobby when I was 19 while I was exploring my higher education options and eventually it became 
                  clear that photography was going to be the way forward for me to fulfill my creative potential.
                </p>
                
                <p>
                  It is my privilege to create beautifully finished photographs that match both the styles and personalities of the 
                  people in them. I pride myself on my diversity and flexibility, the ability to photograph your event in a variety 
                  of styles including candid, fashion forward, traditional or a combination of all three.
                </p>

                <p>
                  My wedding coverage is largely documentary in approach. What transpires between people on a wedding day is most 
                  important. I'm quiet and observant by nature but can effectively direct when needed, aligning my subjects with 
                  beautiful flattering natural light and allowing for natural interactions.
                </p>
              </div>

              <div className="style-section">
                <h3>My Style Approach</h3>
                <div className="style-grid">
                  <div className="style-item">
                    <span className="style-number">01</span>
                    <h4>Documentary</h4>
                    <p>Capturing genuine moments as they unfold</p>
                  </div>
                  <div className="style-item">
                    <span className="style-number">02</span>
                    <h4>Editorial</h4>
                    <p>Crafting beautiful, magazine-worthy shots</p>
                  </div>
                  <div className="style-item">
                    <span className="style-number">03</span>
                    <h4>Creative</h4>
                    <p>Adding artistic flair to every capture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="social-section">
          <h2>Connect With Me</h2>
          <div className="social-icons">
            <a href="https://www.facebook.com/profile.php?id=100084296241929" className="social-link" aria-label="Facebook" target='blank'>
              <Facebook />
            </a>
            <a href="https://www.instagram.com/_.pathumaa._?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-link" aria-label="Instagram" target='blank'>
              <Instagram />
            </a>
            <a href="#" className="social-link" aria-label="Youtube">
              <Youtube />
            </a>
            <a href="pethumlakmal6@gmail.com" className="social-link" aria-label="Email">
              <Mail />
            </a>
          </div>
        </div>

        <div className="cta-section">
          <h2>LET'S CREATE SOMETHING BEAUTIFUL TOGETHER</h2>
          <p>Every moment tells a story. Let me help you tell yours.</p>
          <button className="cta-button">Contact Me</button>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;