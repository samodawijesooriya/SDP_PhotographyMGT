import express from 'express';
import { forgotPassword, verifyResetOTP, resetPassword, resendResetOTP } from '../controllers/passwordController.js';

const passwordRouter = express.Router();

passwordRouter.post('/forgotpassword', forgotPassword);

passwordRouter.post('/verifyresetotp', verifyResetOTP);

passwordRouter.post('/resetpassword', resetPassword);

passwordRouter.post('/resendresetotp', resendResetOTP);

export default passwordRouter;