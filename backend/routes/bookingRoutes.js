// routes/booking-routes.js
import express from 'express';
const router = express.Router();
import {
    getAllBookings,
    deleteBooking,
    updateBooking,
    createBooking,
    getCalendarBookings,
    getBookingsByDate
} from '../controllers/bookingController.js';

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
bookingRouter.post('/', createBooking);

bookingRouter.get('/calendar', getCalendarBookings);

// Get booking by date
bookingRouter.get('/date/:date', getBookingsByDate);

export default bookingRouter;

