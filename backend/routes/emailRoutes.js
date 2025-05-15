import express from 'express';
const router = express.Router();
const emailRouter = express.Router();

import { sendConfirmationEmail, sendpencilConfirmationEmail } from '../controllers/emailController.js';
import sendDailySummaryEmail from '../controllers/bookingDailySummary.js';

emailRouter.post('/sendBookingConfirmation', sendConfirmationEmail);

emailRouter.post('/pencilConfirmation', sendpencilConfirmationEmail);

emailRouter.post('/dailySummary', sendDailySummaryEmail);

export default emailRouter;