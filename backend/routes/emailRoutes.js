import express from 'express';
const router = express.Router();
const emailRouter = express.Router();

import { sendConfirmationEmail, sendpencilConfirmationEmail } from '../controllers/emailController.js';

emailRouter.post('/sendBookingConfirmation', sendConfirmationEmail);

emailRouter.post('/pencilConfirmation', sendpencilConfirmationEmail);

export default emailRouter;