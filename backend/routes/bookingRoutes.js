// routes/booking-routes.js
import express from 'express';
const router = express.Router();
import {
    getAllBookings,
    deleteBooking,
    updateBooking,
    createBooking
} from '../controllers/bookingController.js';

const bookingRouter = express.Router();

// Get all bookings
bookingRouter.get('/', getAllBookings);

// Delete a booking
bookingRouter.delete('/:id', deleteBooking);

// Update a booking
bookingRouter.put('/:id', updateBooking);

// Create a booking
bookingRouter.post('/', createBooking);

export default bookingRouter;

