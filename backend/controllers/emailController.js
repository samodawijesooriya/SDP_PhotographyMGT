// controllers/emailController.js
import nodemailer from 'nodemailer'
import emailTemplates from '../utils/emailTemplates.js';
import 'dotenv/config';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, 
  }
});

const sendConfirmationEmail = async (req, res) => {
  try {
    const {
      email,
      name,
      sessionType,
      date,
      time,
      location,
      price,
      invoiceNumber
    } = req.body;

    // Validate required fields
    if (!email || !sessionType || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required booking information' 
      });
    }

    // Format date for readability
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate email content using template
    const { subject, html } = emailTemplates.bookingConfirmation({
      name,
      sessionType,
      formattedDate,
      time,
      location,
      price,
      invoiceNumber
    });

    // Email options
    const mailOptions = {
      from: `"Photography Studio" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: subject,
      html: html,
    //   attachments: [
    //     {
    //       filename: `invoice-${invoiceNumber}.pdf`,
    //       content: pdfBuffer, // You could generate a PDF invoice
    //       contentType: 'application/pdf'
    //     }
    //   ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log success and respond to client
    console.log(`Confirmation email sent to ${email}`);
    return res.status(200).json({
      success: true,
      message: 'Booking confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  } 
};

const sendpencilConfirmationEmail = async (req, res) => {
  try{
  const {
    email,
    name,
    billingMobile,
    packageName
  } = req.body;

  // Validate required fields
  if (!email || !name || !billingMobile || !packageName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required booking information' 
    });
  }

  // Generate email content using template
  const { subject, html } = emailTemplates.pencilBookingConfirmation({
    name,
    packageName,
    billingMobile,
    packageName
  });

  // Email options
  const mailOptions = {
    from: `"Photography Studio" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    html: html,
  //   attachments: [
  //     {
  //       filename: `invoice-${invoiceNumber}.pdf`,
  //       content: pdfBuffer, // You could generate a PDF invoice
  //       contentType: 'application/pdf'
  //     }
  //   ]
  };

  // Send email
  await transporter.sendMail(mailOptions);

  // Log success and respond to client
  console.log(`Confirmation email sent to ${email}`);
  return res.status(200).json({
    success: true,
    message: 'Booking confirmation email sent successfully'
  });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email',
      error: error.message
    });
  } 
};


export  {sendConfirmationEmail, sendpencilConfirmationEmail};