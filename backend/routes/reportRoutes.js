import express from 'express';
import { 
  getMonthlyStats, 
  getPaymentMethods, 
  getDetailedBookings, 
  getDetailedPayments 
} from '../controllers/reportController.js';

const reportRouter = express.Router();

// Get monthly statistics for charts
reportRouter.get('/monthly-stats', getMonthlyStats);

// Get payment method breakdown for pie chart
reportRouter.get('/payment-methods', getPaymentMethods);

// Get detailed bookings for reports
reportRouter.get('/detailed-bookings', getDetailedBookings);

// Get detailed payments for reports
reportRouter.get('/detailed-payments', getDetailedPayments);

export default reportRouter;
