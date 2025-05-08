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
    createPendingBooking
} from '../controllers/bookingController.js';

import cleanupPencilBookings from '../controllers/cleanup-bookings.js';

const bookingRouter = express.Router();

// Get all bookings
bookingRouter.get('/', getAllBookings);

// create a booking
bookingRouter.post('/create', createBooking);

// Delete a booking
bookingRouter.delete('/:id', deleteBooking);

// Update a booking
bookingRouter.put('/:id', updateBooking);

// Create a booking
bookingRouter.post('/createPending', createPendingBooking);

bookingRouter.get('/calendar', getCalendarBookings);

// Get booking by date
bookingRouter.get('/date/:date', getBookingsByDate);

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

export default bookingRouter;

