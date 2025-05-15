// bookingDailySummary.js
import db from '../config/db.js';
import nodemailer from 'nodemailer';
import emailTemplates from '../utils/emailTemplates.js';
import 'dotenv/config';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_PHOTOGRAPHY_SERVICE,
    pass: process.env.EMAIL_PASSWORD,
  }
});

/**
 * Gets booking statistics for the current day
 * @returns {Promise<Object>} Statistics about today's bookings
 */
const getTodayBookingStats = async () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Query to get counts of bookings by status
    const countQuery = `
      SELECT 
        COUNT(CASE WHEN bookingStatus = 'Cancelled' THEN 1 END) as cancelledCount,
        COUNT(CASE WHEN bookingStatus = 'Pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN bookingStatus = 'Confirmed' THEN 1 END) as confirmedCount,
        COUNT(CASE WHEN bookingStatus = 'Pencil' THEN 1 END) as pencilCount,
        COUNT(*) as totalCount,
        COUNT(CASE WHEN DATE(createdAt) = ? THEN 1 END) as newBookingsCount
      FROM booking
    `;
    
    // Execute the query with today's date
    return new Promise((resolve, reject) => {
      db.query(countQuery, [today], (err, results) => {
        if (err) {
          console.error('Error getting booking stats:', err);
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  } catch (error) {
    console.error('Error in getTodayBookingStats:', error);
    throw error;
  }
};

/**
 * Gets detailed information about confirmed bookings
 * @returns {Promise<Array>} List of confirmed bookings with details
 */
const getConfirmedBookings = async () => {
  try {
    const query = `
      SELECT 
        b.*, 
        c.fullName, 
        c.email,
        p.packageName, 
        p.coverageHours, 
        e.eventName
      FROM Booking b
      JOIN Customers c ON b.customerId = c.customerId
      LEFT JOIN Package p ON b.packageId = p.packageId
      LEFT JOIN Event e ON p.eventId = e.eventId
      WHERE b.bookingStatus = 'Confirmed'
      ORDER BY b.eventDate ASC
    `;
    
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error getting confirmed bookings:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error('Error in getConfirmedBookings:', error);
    throw error;
  }
};

/**
 * Internal function that actually sends the email
 * @returns {Promise<Object>} Result of the email sending operation
 */
const generateAndSendEmail = async () => {
  try {
    // Get booking statistics
    const bookingStats = await getTodayBookingStats();
    
    // Get detailed information about confirmed bookings
    const confirmedBookings = await getConfirmedBookings();
    
    // Format the data for the email template
    const { subject, html } = emailTemplates.dailyBookingSummary({
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      bookingStats,
      confirmedBookings
    });
    
    // Get the administrator's email from environment variable or use a default
    const adminEmail = process.env.ADMIN_EMAIL || 'studio@pathumlweerasighe.com';
    
    // Email options
    const mailOptions = {
      from: `"Photography Studio" <${process.env.EMAIL_FROM}>`,
      to: adminEmail,
      subject: subject,
      html: html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log success
    console.log(`Daily booking summary email sent to ${adminEmail}`);
    
    return {
      success: true,
      message: 'Daily booking summary email sent successfully',
      info
    };
  } catch (error) {
    console.error('Error sending daily summary email:', error);
    return {
      success: false,
      message: 'Failed to send daily booking summary email',
      error: error.message
    };
  }
};

/**
 * Sends a daily summary email to the photographer with booking statistics
 * This function is used as an Express route handler
 */
const sendDailySummaryEmail = async (req, res) => {
  try {
    const result = await generateAndSendEmail();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in sendDailySummaryEmail route handler:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the daily booking summary email',
      error: error.message
    });
  }
};

// Export both the route handler and the internal function for scheduled tasks
export { generateAndSendEmail };
export default sendDailySummaryEmail;
