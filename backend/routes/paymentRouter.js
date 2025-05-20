import express from 'express';
import { 
    getPayment, 
    getAllPayments, 
    getUserPayments, 
    getBookingPayments, 
    getPendingPayments,
    verifyPayment, 
    getPaymentStats, 
    createBankDeposit, 
    createPayment 
} from '../controllers/paymentController.js';
import { uploadReceipt } from '../middleware/upload.js';

const paymentRouter = express.Router();

// // Get a single payment by ID
// paymentRouter.get('/:id', getPayment);

// Get all payments for admin
paymentRouter.get('/', getAllPayments);

// Get payments for specific user
paymentRouter.get('/user/:userId', getUserPayments);

// Get payments for specific booking
paymentRouter.get('/booking/:bookingId', getBookingPayments);

// Get pending payments that need verification
paymentRouter.get('/pendingPayment', getPendingPayments);

// Get payment statistics for dashboard
paymentRouter.get('/stats', getPaymentStats);

// Verify payment (approve or reject)
paymentRouter.post('/verify/:id', verifyPayment);

// Create bank deposit record
paymentRouter.post('/bank-deposit', uploadReceipt, createBankDeposit);

// Create payment record
paymentRouter.post('/create', createPayment);



export default paymentRouter;