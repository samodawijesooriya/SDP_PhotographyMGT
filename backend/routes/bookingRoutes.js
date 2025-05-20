// routes/booking-routes.js
import express from 'express';
const router = express.Router();
import {
    getAllBookings,
    deleteBooking,
    updateBooking,
    createBooking,
    getCalendarBookings,
    getBookingsByDate,
    createPendingBooking,
    getBookingDates,
    getBookingByUserId,
    cancelBooking,
    getCompletedBookings,
    saveBookingStatus
} from '../controllers/bookingController.js';

import cleanupPencilBookings from '../controllers/cleanup-bookings.js';
import upload from '../middleware/upload.js';

const bookingRouter = express.Router();

// Get all bookings
bookingRouter.get('/', getAllBookings);

bookingRouter.get('/user/:userId', getBookingByUserId);

// create a booking
bookingRouter.post('/create', upload.single('bankReceiptImage'), createBooking);

// Delete a booking
bookingRouter.delete('/:id', deleteBooking);

// Update a booking
bookingRouter.put('/:id', updateBooking);

bookingRouter.put('/events/:bookingId', saveBookingStatus);

// Create a booking
bookingRouter.post('/createPending', createPendingBooking);

bookingRouter.get('/calendar', getCalendarBookings);

// Get booking by date
bookingRouter.get('/date/:date', getBookingsByDate);

// Get dates of the bookings
bookingRouter.get('/dates', getBookingDates);

// Cancel a booking (update status to 'Cancelled')
bookingRouter.post('/cancel/:id', cancelBooking);

bookingRouter.post('/cleanup', async (req, res) => {
    try {
      const removedCount = await cleanupPencilBookings();
      res.status(200).json({ 
        message: 'Cleanup process completed successfully',
        removedBookings: removedCount
      });
    } catch (error) {
      console.error('Error triggering cleanup:', error);
      res.status(500).json({ message: 'Failed to trigger cleanup process' });
    }
});

bookingRouter.get('/status/done', getCompletedBookings);

bookingRouter.put('/save/:bookingId', saveBookingStatus);

export default bookingRouter;

