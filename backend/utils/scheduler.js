// scheduler.js
import { generateAndSendEmail } from '../controllers/bookingDailySummary.js';
import 'dotenv/config';

/**
 * Sends the daily booking summary email
 * This function is used by the scheduler
 * @returns {Promise<Object>} Result of the email sending operation
 */
const sendDailySummaryEmail = async () => {
  try {
    console.log('Preparing to send daily booking summary email...');
    
    // Call the function from bookingDailySummary.js
    const result = await generateAndSendEmail();
    
    if (result.success) {
      console.log(`Daily booking summary email sent successfully`);
    } else {
      console.error('Failed to send daily summary email:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in scheduler.sendDailySummaryEmail:', error);
    return {
      success: false,
      message: 'Failed to send daily booking summary email',
      error: error.message
    };
  }
};

/**
 * Initializes the scheduler to send daily summary emails
 * @param {Object} app - Express app instance
 */
const initScheduler = (app) => {
  console.log('Initializing email scheduler...');
  
  // Set up a middleware to check the time and trigger the email if needed
  app.use((req, res, next) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if it's the end of the day (e.g., 6:00 PM)
    if (hours === 23 && minutes === 0) {
      // Store the last time the email was sent
      const lastSent = app.locals.lastDailySummarySent || 0;
      const currentDay = now.toISOString().split('T')[0];
      
      // Only send once per day
      if (lastSent !== currentDay) {
        console.log('Triggering daily summary email...');
        sendDailySummaryEmail()
          .then(result => {
            if (result.success) {
              app.locals.lastDailySummarySent = currentDay;
              console.log('Daily summary email sent successfully');
            } else {
              console.error('Failed to send daily summary email:', result.error);
            }
          })
          .catch(err => {
            console.error('Error in daily summary email scheduler:', err);
          });
      }
    }
    
    next();
  });
  
  console.log('Email scheduler initialized. Daily summary will be sent at 6:00 PM.');
};

export {
  sendDailySummaryEmail,
  initScheduler
};
