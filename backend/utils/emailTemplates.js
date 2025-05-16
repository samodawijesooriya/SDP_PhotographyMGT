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


const dailyBookingSummary = (data) => {
  const {
    date,
    bookingStats,
    confirmedBookings
  } = data;

  // Format confirmed bookings into HTML
  const confirmedBookingsHTML = confirmedBookings.map(booking => {
    const eventDate = booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Not specified';

    return `
      <tr>
        <td>${booking.fullName || 'Not specified'}</td>
        <td>${booking.packageName || 'Not specified'}</td>
        <td>${booking.eventName || 'Not specified'}</td>
        <td>${eventDate}</td>
        <td>${booking.eventTime || 'Not specified'}</td>
        <td>${booking.venue || 'Not specified'}</td>
      </tr>
    `;
  }).join('');

  return {
    subject: `Daily Booking Summary - ${date}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Booking Summary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #f5f5f5;
            margin-bottom: 20px;
          }
          .stats-container {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: 30px;
          }
          .stat-box {
            flex: 1;
            min-width: 120px;
            background: #f9f9f9;
            border-radius: 5px;
            padding: 15px;
            margin: 5px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .stat-box h3 {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .stat-box p {
            margin: 10px 0 0;
            font-size: 24px;
            font-weight: bold;
          }
          .stat-box.pending { background-color: #fff8e1; }
          .stat-box.confirmed { background-color: #e8f5e9; }
          .stat-box.cancelled { background-color: #ffebee; }
          .stat-box.pencil { background-color: #e3f2fd; }
          .stat-box.new { background-color: #f3e5f5; }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          .section-title {
            color: #333;
            border-bottom: 2px solid #f5f5f5;
            padding-bottom: 10px;
            margin-top: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Daily Booking Summary</h1>
            <p>${date}</p>
          </div>
          
          <h2 class="section-title">Booking Statistics</h2>
          
          <div class="stats-container">
            <div class="stat-box new">
              <h3>New Bookings Today</h3>
              <p>${bookingStats.newBookingsCount || 0}</p>
            </div>
            <div class="stat-box pencil">
              <h3>Pencil Bookings</h3>
              <p>${bookingStats.pencilCount || 0}</p>
            </div>
            <div class="stat-box pending">
              <h3>Pending Bookings</h3>
              <p>${bookingStats.pendingCount || 0}</p>
            </div>
            <div class="stat-box confirmed">
              <h3>Confirmed Bookings</h3>
              <p>${bookingStats.confirmedCount || 0}</p>
            </div>
            <div class="stat-box cancelled">
              <h3>Cancelled Bookings</h3>
              <p>${bookingStats.cancelledCount || 0}</p>
            </div>
          </div>
          
          <h2 class="section-title">Upcoming Confirmed Bookings</h2>
          
          ${confirmedBookings.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Package</th>
                <th>Event Type</th>
                <th>Event Date</th>
                <th>Time</th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody>
              ${confirmedBookingsHTML}
            </tbody>
          </table>
          ` : '<p>No confirmed bookings at this time.</p>'}
          
          <p>This is an automated summary of the current booking status. Please review and take necessary actions.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pathum L Weerasighe Photography. All rights reserved.</p>
            <p>This email was sent automatically at the end of the business day.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};


export default {
  bookingConfirmation,
  pencilBookingConfirmation,
  dailyBookingSummary
};