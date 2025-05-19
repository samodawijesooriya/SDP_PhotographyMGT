import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../controllers/emailController.js';

// Helper function for database queries with Promises
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

// Helper function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const sqlCheck = 'SELECT * FROM user WHERE email = ?';
        const results = await queryDatabase(sqlCheck, [email]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No account is associated with this email"
            });
        }

        const user = results[0];

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Store OTP in database
        const updateQuery = 'UPDATE user SET resetPasswordOTP = ?, resetPasswordOTPExpiry = ? WHERE userID = ?';
        await queryDatabase(updateQuery, [otp, otpExpiry, user.userID]);
        
        // Send OTP to user's email
        await sendResetPasswordEmail(email, otp);
        
        return res.status(200).json({
            success: true,
            message: "Password reset OTP has been sent to your email"
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during password reset request'
        });
    }
};

// Verify OTP for password reset
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate inputs
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Find user with this email
        const sqlQuery = 'SELECT * FROM user WHERE email = ?';
        const results = await queryDatabase(sqlQuery, [email]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];

        // Verify OTP
        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check if OTP is expired
        if (new Date() > new Date(user.resetPasswordOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during OTP verification'
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate inputs
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required"
            });
        }

        // Password validation
        if (newPassword.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 5 characters long"
            });
        }

        // Find user with this email
        const sqlQuery = 'SELECT * FROM user WHERE email = ?';
        const results = await queryDatabase(sqlQuery, [email]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];

        // Verify OTP again for security
        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check if OTP is expired
        if (new Date() > new Date(user.resetPasswordOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Update password
        const updateQuery = 'UPDATE user SET password = ?, resetPasswordOTP = NULL, resetPasswordOTPExpiry = NULL WHERE userID = ?';
        await queryDatabase(updateQuery, [newPassword, user.userID]);

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// Resend OTP for password reset
const resendResetOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user with this email
        const sqlQuery = 'SELECT * FROM user WHERE email = ?';
        const results = await queryDatabase(sqlQuery, [email]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Update OTP in database
        const updateQuery = 'UPDATE user SET resetPasswordOTP = ?, resetPasswordOTPExpiry = ? WHERE userID = ?';
        await queryDatabase(updateQuery, [otp, otpExpiry, user.userID]);
        
        // Send new OTP to user's email
        await sendResetPasswordEmail(email, otp);
        
        return res.status(200).json({
            success: true,
            message: "New OTP has been sent to your email"
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while resending OTP'
        });
    }
};

export { forgotPassword, verifyResetOTP, resetPassword, resendResetOTP };