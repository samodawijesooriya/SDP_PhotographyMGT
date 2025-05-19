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

// Add this function alongside your existing email functions
export const sendResetPasswordEmail = async (email, otp) => {
    try {
        // Configure your email sending logic here (similar to sendVerificationEmail)
        // Example using nodemailer:
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset - Your OTP',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Please use the following OTP to verify your identity:</p>
                    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw error;
    }
};

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with our service. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="margin: 30px 0; text-align: center;">
          <div style="display: inline-block; background-color: #f5f5f5; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</div>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">This OTP will expire in 10 minutes.</p>
        <p style="font-size: 16px; line-height: 1.5;">If you did not request this verification, please ignore this email.</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
}

const sendAccountCreationEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Pathum L Weerasighe Photography - Account Created Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Service!</h2>
        <p style="font-size: 16px; line-height: 1.5;">Hello ${username},</p>
        <p style="font-size: 16px; line-height: 1.5;">Your account has been successfully created and verified. We're excited to have you join us!</p>
        <div style="margin: 30px 0; text-align: center;">
          <div style="display: inline-block; background-color: #4CAF50; padding: 15px 30px; border-radius: 5px; font-size: 18px; font-weight: bold; color: white;">Your Account is Ready</div>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">You can now log in using your credentials and start exploring our services.</p>
        <p style="font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <div style="margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="font-size: 14px; margin: 0; line-height: 1.5;"><strong>Account Information:</strong></p>
          <p style="font-size: 14px; margin: 5px 0; line-height: 1.5;">Username: ${username}</p>
          <p style="font-size: 14px; margin: 5px 0; line-height: 1.5;">Email: ${email}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for choosing our service!</p>
        <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending welcome email:', error);
        reject(error);
      } else {
        console.log('Welcome email sent:', info.response);
        resolve(info);
      }
    });
  });
};


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

export { sendConfirmationEmail, sendpencilConfirmationEmail, sendVerificationEmail , sendAccountCreationEmail };