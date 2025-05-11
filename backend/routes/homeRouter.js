import express from 'express';
import { getBookingStats, getUpcomingBookings, getSummaryStats, getNewBookings } from '../controllers/homeController.js';

const homeRouter = express.Router();


// Route to get booking statistics
homeRouter.get('/booking-stats', getBookingStats);

// Route to get upcoming bookings
homeRouter.get('/upcoming-bookings', getUpcomingBookings);

homeRouter.get('/sumary-stats', getSummaryStats);

homeRouter.get('/new-bookings', getNewBookings);

export default homeRouter;