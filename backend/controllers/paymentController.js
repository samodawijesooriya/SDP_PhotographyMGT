import db from '../config/db.js';
import fetch from 'node-fetch';
import 'dotenv/config';

const queryDatabase = (query, params) => {
  return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
          if (err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
};

const getPayment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                c.customerId, 
                c.fullName, 
                c.email, 
                c.billingMobile, 
                c.billingAddress,
                bd.bankDepositId, 
                bd.referenceNo, 
                bd.receiptImage, 
                bd.depositAmount
            FROM payment p
            LEFT JOIN booking b ON p.bookingId = b.bookingId
            LEFT JOIN customers c ON b.customerId = c.customerId
            LEFT JOIN bankdeposits bd ON p.bankDepositId = bd.bankDepositId
            WHERE p.paymentId = ?
        `;
        
        queryDatabase(query, [id], (err, result) => {
            if (err) {
                console.error('Error retrieving payment:', err);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }
        
            res.status(200).json(result[0]);
            return res.status(200).json(payment[0]);    
        });
        
    } catch (error) {
        console.error('Error retrieving payment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                c.customerId, 
                c.fullName, 
                c.email, 
                c.billingMobile,
                bd.bankDepositId, 
                bd.referenceNo, 
                bd.receiptImage
            FROM payment p
            LEFT JOIN booking b ON p.bookingId = b.bookingId
            LEFT JOIN customers c ON b.customerId = c.customerId
            LEFT JOIN bankdeposits bd ON p.bankDepositId = bd.bankDepositId
            ORDER BY p.paymentDate DESC
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error retrieving payments:', err);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }   
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error retrieving payments:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get payments by user ID (for customer portal)
 */
const getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                bd.referenceNo, 
                bd.receiptImage
            FROM payment p
            LEFT JOIN booking b ON p.bookingId = b.bookingId
            LEFT JOIN customer c ON b.customerId = c.customerId
            LEFT JOIN bankdeposit bd ON p.bankDepositId = bd.bankDepositId
            WHERE c.userID = ?
            ORDER BY p.paymentDate DESC
        `;
        
        db.query(query, [userId], (err, results) => { 
            if (err) {
                console.error('Error retrieving user payments:', err);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }   
            res.status(200).json(results);
        });

    } catch (error) {
        console.error('Error retrieving user payments:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get payments by booking ID
 */
const getBookingPayments = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const query = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                bd.bankDepositId, 
                bd.referenceNo, 
                bd.receiptImage
            FROM payment p
            LEFT JOIN bankdeposit bd ON p.bankDepositId = bd.bankDepositId
            WHERE p.bookingId = ?
            ORDER BY p.paymentDate DESC
        `;
        
        const [payments] = await db.query(query, [bookingId]);
        
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error retrieving booking payments:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get all pending payments (for admin approval)
 */
const getPendingPayments = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                c.customerId, 
                c.fullName, 
                c.email, 
                c.billingMobile,
                bd.bankDepositId, 
                bd.referenceNo, 
                bd.receiptImage
            FROM payment p
            LEFT JOIN booking b ON p.bookingId = b.bookingId
            LEFT JOIN customers c ON b.customerId = c.customerId
            LEFT JOIN bankdeposits bd ON p.bankDepositId = bd.bankDepositId
            WHERE p.paymentStatus = 'pending'
            ORDER BY p.paymentDate DESC
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error retrieving pending payments:', err);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }   
            res.status(200).json(results);
        });
        
    } catch (error) {
        console.error('Error retrieving pending payments:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Verify a bank transfer payment (approve or reject)
 */
const verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "confirmed" or "rejected"' });
        }
        
        // Update payment status
        const updateQuery = `
            UPDATE payment
            SET paymentStatus = ?
            WHERE paymentId = ?
        `;
        
        await db.query(updateQuery, [status, id]);
        
        // If payment is confirmed, update booking balance amount
        if (status === 'confirmed') {
            // First get the payment and booking info
            const paymentQuery = `
                SELECT p.paymentAmount, p.bookingId, b.balanceAmount
                FROM payment p
                JOIN booking b ON p.bookingId = b.bookingId
                WHERE p.paymentId = ?
            `;
            
            const [paymentInfo] = await db.query(paymentQuery, [id]);
            
            if (paymentInfo.length > 0) {
                const { paymentAmount, bookingId, balanceAmount } = paymentInfo[0];
                const newBalance = parseFloat(balanceAmount) - parseFloat(paymentAmount);
                
                // Update booking balance amount
                const updateBookingQuery = `
                    UPDATE booking
                    SET balanceAmount = ?
                    WHERE bookingId = ?
                `;
                
                await db.query(updateBookingQuery, [newBalance >= 0 ? newBalance : 0, bookingId]);
                
                // If balance is 0, update booking status to confirmed (if it was pending)
                if (newBalance <= 0) {
                    const updateStatusQuery = `
                        UPDATE booking
                        SET bookingStatus = 'Confirmed'
                        WHERE bookingId = ? AND bookingStatus = 'Pending'
                    `;
                    
                    await db.query(updateStatusQuery, [bookingId]);
                }
            }
        }
        
        // Get customer information to send email notification
        const getCustomerQuery = `
            SELECT 
                p.paymentId, 
                p.bookingId, 
                p.paymentAmount, 
                p.paymentDate, 
                p.paymentMethod, 
                p.paymentStatus,
                c.customerId, 
                c.fullName,
                c.email,
                b.balanceAmount,
                b.bookingStatus,
                bd.referenceNo
            FROM payment p
            LEFT JOIN booking b ON p.bookingId = b.bookingId
            LEFT JOIN customer c ON b.customerId = c.customerId
            LEFT JOIN bankdeposit bd ON p.bankDepositId = bd.bankDepositId
            WHERE p.paymentId = ?
        `;
        
        const [paymentDetails] = await db.query(getCustomerQuery, [id]);
        
        // Send email notification
        if (paymentDetails.length > 0) {
            try {
                const paymentDetail = paymentDetails[0];
                
                await fetch(`${process.env.API_URL}/api/email/paymentStatus`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: paymentDetail.email,
                        name: paymentDetail.fullName,
                        paymentId: paymentDetail.paymentId,
                        bookingId: paymentDetail.bookingId,
                        paymentAmount: paymentDetail.paymentAmount,
                        paymentDate: paymentDetail.paymentDate,
                        paymentStatus: status,
                        referenceNo: paymentDetail.referenceNo
                    })
                });
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Don't return error, continue with the process
            }
        }
        
        res.status(200).json({
            message: `Payment ${status}`,
            payment: paymentDetails[0]
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Get payment statistics for admin dashboard
 */
const getPaymentStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as totalPayments,
                SUM(paymentAmount) as totalAmount,
                COUNT(CASE WHEN paymentStatus = 'pending' THEN 1 END) as pendingPayments,
                SUM(CASE WHEN paymentStatus = 'pending' THEN paymentAmount ELSE 0 END) as pendingAmount,
                COUNT(CASE WHEN paymentMethod = 'bankTransfer' THEN 1 END) as bankTransfers,
                COUNT(CASE WHEN paymentMethod = 'creditCard' THEN 1 END) as creditCardPayments
            FROM payment
        `;
        
        const [stats] = await db.query(query);
        
        res.status(200).json(stats[0]);
    } catch (error) {
        console.error('Error retrieving payment stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Create a new bank deposit record
 */
const createBankDeposit = async (req, res) => {
    try {
        const { referenceNo, depositAmount } = req.body;
        const receiptImage = req.file ? req.file.path : null;
        
        if (!receiptImage) {
            return res.status(400).json({ message: 'Receipt image is required' });
        }
        
        const query = `
            INSERT INTO bankdeposit (referenceNo, receiptImage, depositAmount)
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.query(query, [referenceNo, receiptImage, depositAmount]);
        
        res.status(201).json({
            message: 'Bank deposit created successfully',
            bankDepositId: result.insertId,
            receiptImage
        });
    } catch (error) {
        console.error('Error creating bank deposit:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

/**
 * Create a new payment record
 */
const createPayment = async (req, res) => {
    try {
        const { bookingId, paymentAmount, paymentMethod, bankDepositId, creditCardId } = req.body;
        
        const query = `
            INSERT INTO payment (bookingId, paymentAmount, paymentDate, paymentMethod, bankDepositId, creditCardId, paymentStatus)
            VALUES (?, ?, NOW(), ?, ?, ?, ?)
        `;
        
        // If it's a bank transfer, it needs approval
        const paymentStatus = paymentMethod === 'bankTransfer' ? 'pending' : 'confirmed';
        
        const [result] = await db.query(query, [
            bookingId, 
            paymentAmount, 
            paymentMethod, 
            bankDepositId || null, 
            creditCardId || null, 
            paymentStatus
        ]);
        
        // If it's a credit card payment, update booking balance immediately
        if (paymentMethod !== 'bankTransfer') {
            // Get current balance amount
            const balanceQuery = `SELECT balanceAmount FROM booking WHERE bookingId = ?`;
            const [balanceResult] = await db.query(balanceQuery, [bookingId]);
            
            if (balanceResult.length > 0) {
                const currentBalance = parseFloat(balanceResult[0].balanceAmount);
                const newBalance = currentBalance - parseFloat(paymentAmount);
                
                // Update booking balance
                const updateBalanceQuery = `
                    UPDATE booking
                    SET balanceAmount = ?
                    WHERE bookingId = ?
                `;
                
                await db.query(updateBalanceQuery, [newBalance >= 0 ? newBalance : 0, bookingId]);
                
                // If balance is 0, update booking status to confirmed (if it was pending)
                if (newBalance <= 0) {
                    const updateStatusQuery = `
                        UPDATE booking
                        SET bookingStatus = 'Confirmed'
                        WHERE bookingId = ? AND bookingStatus = 'Pending'
                    `;
                    
                    await db.query(updateStatusQuery, [bookingId]);
                }
            }
        }
        
        res.status(201).json({
            message: 'Payment created successfully',
            paymentId: result.insertId,
            paymentStatus
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export {
    getPayment,
    getAllPayments,
    getUserPayments,
    getBookingPayments,
    getPendingPayments,
    verifyPayment,
    getPaymentStats,
    createBankDeposit,
    createPayment
};