import React, { useState } from 'react';
import { 
    Facebook, 
    Instagram, 
    AlignVerticalDistributeCenter, // TikTok
    Share2 // Threads
} from 'lucide-react';
import './Contact.css';
import Footer from '../../components/Footer/Footer';
import emailjs from '@emailjs/browser';

const Contact = () => {
    // Initialize state for form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    // Add handleChange function to update form data
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await emailjs.send(
                'service_f0dlupn',
                'template_ko7cc9q',
                formData,
                'g9mtFamuBHtZMMRMa'
            );
            alert('Message sent successfully!');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className='Main'>
        <div className="contact-container">
            <div className="contact-header">
                <h1>Get in Touch</h1>
                <p>Let's create something amazing together</p>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="info-box">
                        <i className="fas fa-map-marker-alt"></i>
                        <div>
                            <h3>Location</h3>
                            <p>Legalle,</p>
                            <p>Sri Lanka</p>
                        </div>
                    </div>

                    <div className="info-box">
                        <i className="fas fa-phone"></i>
                        <div>
                            <h3>Phone</h3>
                            <p>+ (94) 76 451 8697</p>
                            <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
                        </div>
                    </div>

                    <div className="info-box">
                        <i className="fas fa-envelope"></i>
                        <div>
                            <h3>Email</h3>
                            <p>pathum@photostudio.com</p>
                            <p>pethumlakmal6@gmail.com</p>
                        </div>
                    </div>

                    <div className="social-links">
                        <a 
                            href="https://www.facebook.com/PathumLakmal" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon"
                        >
                            <Facebook size={24} strokeWidth={1.5} />
                        </a>
                        <a 
                            href="https://www.instagram.com/pathum_lakmal_photography" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon"
                        >
                            <Instagram size={24} strokeWidth={1.5} />
                        </a>
                        <a 
                            href="https://www.tiktok.com/@pathum_lakmal" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon"
                        >
                            <AlignVerticalDistributeCenter size={24} strokeWidth={1.5} />
                        </a>
                        <a 
                            href="https://www.threads.net/@pathum_lakmal_photography" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-icon"
                        >
                            <Share2 size={24} strokeWidth={1.5} />
                        </a>
                    </div>
                </div>

                <div className="contact-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Your Email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Subject"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your Message"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>
            </div>

            <div className="map-container">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7915.703746529505!2d80.34089718974283!3d7.257693870995977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae316b7a159fd01%3A0xf7cdc3d49f78f117!2sKegalle%20Town!5e0!3m2!1ssi!2slk!4v1739701889243!5m2!1ssi!2slk"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
        <Footer />
        </div>
    );
};

export default Contact;