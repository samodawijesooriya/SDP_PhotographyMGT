const bookingConfirmation = (data) => {
    const {
      name,
      sessionType,
      formattedDate,
      time,
      location,
      price,
      invoiceNumber
    } = data;
  
    return {
      subject: `Your Photography Session Booking Confirmation - #${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 2px solid #f5f5f5;
            }
            .booking-details {
              margin: 20px 0;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
            }
            .booking-details table {
              width: 100%;
              border-collapse: collapse;
            }
            .booking-details th {
              text-align: left;
              padding: 8px;
              width: 40%;
            }
            .booking-details td {
              padding: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Thank you for booking with us!</p>
            </div>
            
            <p>Dear ${name || 'Valued Customer'},</p>
            
            <p>We're excited to confirm your photography session booking. Here are your booking details:</p>
            
            <div class="booking-details">
              <table>
                <tr>
                  <th>Invoice Number:</th>
                  <td>${invoiceNumber}</td>
                </tr>
                <tr>
                  <th>Session Type:</th>
                  <td>${sessionType}</td>
                </tr>
                <tr>
                  <th>Date:</th>
                  <td>${formattedDate}</td>
                </tr>
                <tr>
                  <th>Time:</th>
                  <td>${time}</td>
                </tr>
                ${location ? `
                <tr>
                  <th>Location:</th>
                  <td>${location}</td>
                </tr>
                ` : ''}
                <tr>
                  <th>Total Amount:</th>
                  <td>${typeof price === 'number' ? `$${price.toFixed(2)}` : price}</td>
                </tr>
              </table>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>If the booking is a pencil booking then it will removed after one week.</li>
              <li>Balance amount of the pending booking should be given before the event date.</li>
              <li>Extra one hour will be charged at the rate of LKR 1,000</li>
              <li>If you need to reschedule, please contact us at least 48 hours in advance.</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact us at support@photographystudio.com or call us at (555) 123-4567.</p>
            
            <p>We look forward to capturing your special moments!</p>
            
            <p>Best regards,<br>Pathum L Weerasighe Photography</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pathum L Weerasighe Photography. All rights reserved.</p>
              <p>Kegalle, Sri Lanaka</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  };

const pencilBookingConfirmation = (data) => {
  const {
    name,
    packageName,
    billingMobile,
  } = data;

  return {
    subject: `Your Photography Session pencil Booking Confirmation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>pencil Booking Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #f5f5f5;
          }
          .booking-details {
            margin: 20px 0;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
          }
          .booking-details table {
            width: 100%;
            border-collapse: collapse;
          }
          .booking-details th {
            text-align: left;
            padding: 8px;
            width: 40%;
          }
          .booking-details td {
            padding: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
          .important-note {
            background-color: #fff9e6;
            border-left: 4px solid #ffcc00;
            padding: 12px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>pencil Booking Confirmation</h1>
            <p>Thank you for your interest in our services!</p>
          </div>
          
          <p>Dear ${name || 'Valued Customer'},</p>
          
          <p>We have received your pencil booking request for our photography services. Your booking is currently on hold until we confirm availability.</p>
          
          <div class="booking-details">
            <table>
              <tr>
                <th>Package Selected:</th>
                <td>${packageName}</td>
              </tr>
              <tr>
                <th>Contact Number:</th>
                <td>${billingMobile}</td>
              </tr>
            </table>
          </div>
          
          <div class="important-note">
            <p><strong>Important Note:</strong></p>
            <p>This is a pencil booking. Our team will contact you within 24-48 hours to confirm the availability and schedule your session.</p>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>We will contact you shortly to confirm the details of your booking.</li>
            <li>A deposit of 50% is required to secure your booking date.</li>
            <li>This pencil booking will be removed after one week if not confirmed.</li>
            <li>Balance payment is due before the event date.</li>
          </ul>
          
          <p>If you have any questions in the meantime, please don't hesitate to contact us at support@photographystudio.com or call us at (555) 123-4567.</p>
          
          <p>We look forward to working with you to capture your special moments!</p>
          
          <p>Best regards,<br>Pathum L Weerasighe Photography</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pathum L Weerasighe Photography. All rights reserved.</p>
            <p>Kegalle, Sri Lanka</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};


export default {
  bookingConfirmation,
  pencilBookingConfirmation
};