// controllers/packageController.js
import db from '../config/db.js';
import fs from 'fs';


// Get all bookings with package information
const getAllBookings = async (req, res) => {  
    try {
      const query = `
        SELECT 
    b.*,
    c.fullName, 
    c.email, 
    c.billingAddress, 
    c.billingMobile,
    p.packageName, 
    p.coverageHours, 
    p.investedAmount,
    e.eventName,
    COALESCE(p.investedAmount, 0) - COALESCE(pay_sum.total_paid, 0) AS balanceAmount
FROM 
    Booking b
JOIN 
    Customers c ON b.customerId = c.customerId
LEFT JOIN 
    Package p ON b.packageId = p.packageId
LEFT JOIN 
    Event e ON p.eventId = e.eventId
LEFT JOIN (
    SELECT 
        bookingId, 
        SUM(paymentAmount) AS total_paid
    FROM 
        Payment
    WHERE 
        paymentStatus = 'Completed' OR paymentStatus = 'Pending'
    GROUP BY 
        bookingId
) pay_sum ON pay_sum.bookingId = b.bookingId
ORDER BY 
    b.eventDate DESC;
      `;
      
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching bookings:', err);
          return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getBookingByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
      const query = `
          SELECT 
          b.*,
          c.fullName, 
          c.email, 
          c.billingAddress, 
          c.billingMobile,
          p.packageName, 
          p.coverageHours, 
          p.investedAmount,
          e.eventName,
          COALESCE(p.investedAmount, 0) - COALESCE(pay_sum.total_paid, 0) AS balanceAmount
      FROM 
          Booking b
      JOIN 
          Customers c ON b.customerId = c.customerId
      LEFT JOIN 
          Package p ON b.packageId = p.packageId
      LEFT JOIN 
          Event e ON p.eventId = e.eventId
      LEFT JOIN (
          SELECT 
          bookingId, 
          SUM(paymentAmount) AS total_paid
          FROM 
          Payment
          WHERE 
          paymentStatus = 'Completed' OR paymentStatus = 'Pending'
          GROUP BY 
          bookingId
      ) pay_sum ON pay_sum.bookingId = b.bookingId
      WHERE c.userID = ?
      ORDER BY 
          b.eventDate DESC;
        `;

      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching bookings:', err);
          return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        console.log('Fetched bookings:', results);
        res.json(results);
      });
    } catch (error) {
      console.error('Error in getBookingByUserId:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  };

  // Delete a booking
// Delete a booking
const deleteBooking = async (req, res) => {
    try {
      const { id } = req.params;
      
      // First, check if the booking exists
      const checkQuery = 'SELECT * FROM booking WHERE bookingId = ?';
      
      db.query(checkQuery, [id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Error checking booking existence:', checkErr);
          return res.status(500).json({ error: 'Failed to check booking existence' });
        }
        
        if (checkResults.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Get payment information before deletion to access bank deposit info and receipt path
        const getPaymentQuery = `
          SELECT p.paymentId, p.bankDepositId, bd.receiptImage
          FROM Payment p
          LEFT JOIN bankDeposits bd ON p.bankDepositId = bd.bankDepositId
          WHERE p.bookingId = ?
        `;
        
        db.query(getPaymentQuery, [id], (paymentInfoErr, paymentInfo) => {
          if (paymentInfoErr) {
            console.error('Error getting payment information:', paymentInfoErr);
            return res.status(500).json({ error: 'Failed to get payment information' });
          }
          
          // Store receipt image paths to delete files after DB operations
          const receiptImagePaths = paymentInfo
            .filter(item => item.receiptImage)
            .map(item => item.receiptImage);
          
          // Get bank deposit IDs to delete
          const bankDepositIds = paymentInfo
            .filter(item => item.bankDepositId)
            .map(item => item.bankDepositId);
          
          // Delete payments first (due to foreign key constraints)
          const deletePaymentsQuery = 'DELETE FROM Payment WHERE bookingId = ?';
          
          db.query(deletePaymentsQuery, [id], (paymentErr) => {
            if (paymentErr) {
              console.error('Error deleting related payments:', paymentErr);
              return res.status(500).json({ error: 'Failed to delete related payments' });
            }
            
            // Delete bank deposits if any exist
            if (bankDepositIds.length > 0) {
              const deleteBankDepositsQuery = 'DELETE FROM bankDeposits WHERE bankDepositId IN (?)';
              
              db.query(deleteBankDepositsQuery, [bankDepositIds], (bankDepositErr) => {
                if (bankDepositErr) {
                  console.error('Error deleting bank deposits:', bankDepositErr);
                  return res.status(500).json({ error: 'Failed to delete bank deposits' });
                }
                
                // Delete the booking
                deleteBookingAndFiles();
              });
            } else {
              // If no bank deposits, proceed to delete the booking
              deleteBookingAndFiles();
            }
          });
          
          // Function to delete the booking and associated files
          const deleteBookingAndFiles = () => {
            const deleteBookingQuery = 'DELETE FROM booking WHERE bookingId = ?';
            
            db.query(deleteBookingQuery, [id], (err, results) => {
              if (err) {
                console.error('Error deleting booking:', err);
                return res.status(500).json({ error: 'Failed to delete booking' });
              }
              
              if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Booking not found or already deleted' });
              }
              
              // Delete receipt image files from the filesystem
              receiptImagePaths.forEach(imagePath => {
                if (imagePath) {
                  try {
                    fs.unlinkSync(imagePath);
                    console.log(`Successfully deleted file: ${imagePath}`);
                  } catch (fileErr) {
                    console.error(`Error deleting file ${imagePath}:`, fileErr);
                    // Continue with the response even if file deletion fails
                  }
                }
              });
              
              // Check if we need to delete the customer as well
              const getCustomerQuery = 'SELECT customerId FROM booking WHERE bookingId = ?';
              
              db.query(getCustomerQuery, [id], (customerErr, customerResults) => {
                if (customerErr) {
                  console.error('Error fetching customer ID:', customerErr);
                  return res.status(500).json({ error: 'Failed to fetch customer ID' });
                }
                
                const customerId = customerResults[0]?.customerId;
                
                // Delete related customer if no other bookings exist
                const deleteCustomerQuery = 'DELETE FROM Customers WHERE customerId = ? AND NOT EXISTS (SELECT 1 FROM booking WHERE customerId = ?)';
                
                db.query(deleteCustomerQuery, [customerId, customerId], (deleteErr) => {
                  if (deleteErr) {
                    console.error('Error deleting related customer:', deleteErr);
                    return res.status(500).json({ error: 'Failed to delete related customer' });
                  }
                  res.json({ 
                    message: 'Booking deleted successfully',
                    deletedId: id
                  });
                });
              });
            });
          };
        });
      });
    } catch (error) {
      console.error('Error in deleteBooking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      billingMobile,
      billingAddress,
      eventDate,
      eventTime,
      venue,
      packageId,
      bookingStatus,
      notes,
      paidAmount,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !billingMobile || !eventDate || !packageId) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['fullName', 'email', 'billingMobile', 'eventDate', 'packageId']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate mobile number format (10-digit)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(billingMobile)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // validate the paid amount
    if (paidAmount && isNaN(paidAmount)) {
      return res.status(400).json({ error: 'Invalid paid amount' });
    }


    // First get the existing booking to get the customer ID
    const getBookingQuery = 'SELECT customerId FROM booking WHERE bookingId = ?';
    const booking = await queryDatabase(getBookingQuery, [id]);

    if (!booking.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const customerId = booking[0].customerId;

    const getPaymentQuery = 'SELECT paymentId FROM payment WHERE bookingId = ?';
    const payment = await queryDatabase(getPaymentQuery, [id]);

    if (!payment.length) {
      return res.status(404).json({ error: 'PaymentId not found' });
    }
    const paymentId = payment[0].paymentId;

    // update payemnt information
    const updatePaymentQuery = `
      UPDATE payment
      SET paymentAmount = ?
      WHERE paymentId = ?
    `;

    await queryDatabase(updatePaymentQuery, [
      paidAmount,
      paymentId
    ]);


    // Update customer information
    const updateCustomerQuery = `
      UPDATE Customers 
      SET fullName = ?, 
          email = ?, 
          billingMobile = ?, 
          billingAddress = ?
      WHERE customerId = ?
    `;

    await queryDatabase(updateCustomerQuery, [
      fullName,
      email,
      billingMobile,
      billingAddress,
      customerId
    ]);

    // Update booking information
    const updateBookingQuery = `
      UPDATE booking 
      SET packageId = ?,
          eventDate = ?,
          eventTime = ?,
          venue = ?,
          bookingStatus = ?,
          notes = ?
      WHERE bookingId = ?
    `;

    await queryDatabase(updateBookingQuery, [
      packageId,
      eventDate,
      eventTime,
      venue,
      bookingStatus,
      notes,
      id
    ]);

    res.json({
      message: 'Booking updated successfully',
      bookingId: id,
      updatedDetails: {
        fullName,
        email,
        eventDate,
        packageId,
        bookingStatus
      }
    });

  } catch (error) {
    console.error('Error in updateBooking:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Referenced package does not exist' });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

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

const createPendingBooking = async (req, res) => {
  const{
    fullName,
    email,
    billingMobile,
    billingAddress,
    packageId,
    bookingStatus,
    notes
  } = req.body;

  try{
    if (!fullName || !email || !billingMobile || !packageId ) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        requiredFields: ['fullName', 'email', 'billingMobile', 'eventDate', 'packageId', 'totalAmount', 'paymentMethod']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate mobile number format (assuming 10-digit)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(billingMobile)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    
    // Check if customer already exists with the same name and email
    const checkExistingCustomerQuery = 'SELECT customerId FROM Customers WHERE email = ? AND fullName = ? LIMIT 1';
    const existingCustomer = await queryDatabase(checkExistingCustomerQuery, [email, fullName]);

    let newCustomerId;

    if (existingCustomer && existingCustomer.length > 0) {
      // Use existing customer's ID
      newCustomerId = existingCustomer[0].customerId;
      console.log(`Using existing customer ID: ${newCustomerId}`);
    } else {
      // Customer doesn't exist, create a new one
      // First, get the last customer ID
      const lastCustomerQuery = 'SELECT customerId FROM Customers ORDER BY customerId DESC LIMIT 1';
      const lastCustomer = await queryDatabase(lastCustomerQuery);
      
      // Generate new customer ID (increment from last one or start at 1)
      newCustomerId = lastCustomer.length > 0 ? lastCustomer[0].customerId + 1 : 1;

      // Insert new customer
      const customerQuery = 'INSERT INTO Customers (customerId, fullName, email, billingMobile, billingAddress) VALUES (?, ?, ?, ?, ?)';
      const customerResult = await queryDatabase(customerQuery, [newCustomerId, fullName, email, billingMobile, billingAddress]);

      if (!customerResult || !customerResult.affectedRows) {
        throw new Error('Failed to insert customer');
      }
    }

    // Insert new booking
    const lastBookingQuery = 'SELECT bookingId FROM booking ORDER BY bookingId DESC LIMIT 1';
    const lastBooking = await queryDatabase(lastBookingQuery);
    const newBookingId = lastBooking.length > 0 ? lastBooking[0].bookingId + 1 : 1;
    
    const bookingQuery = `INSERT INTO booking (bookingId, customerId, packageId, bookingStatus, notes) VALUES (?, ?, ?, ?, ?)`;
    const bookingResult = await queryDatabase(bookingQuery, [newBookingId, newCustomerId, packageId, bookingStatus, notes]);
    
    if (!bookingResult || !bookingResult.affectedRows) {
      throw new Error('Failed to insert booking');
    }

    // Return success response
    res.status(201).json({ 
      message: 'Pending Booking created successfully',
      bookingId: newBookingId,
      customerId: newCustomerId,
      bookingDetails: {
        fullName,
        email,
        packageId,
        bookingStatus: bookingStatus
      }
    });
  }catch(error){
    console.error('Error in createBooking:', error);
      
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry detected' });
      }
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Referenced record does not exist' });
      }
      
      // Handle custom validation errors
      if (error.message.includes('Failed to insert')) {
        return res.status(500).json({ error: 'Database operation failed', details: error.message });
      }
      
      // Generic error response
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      });
    }
  }

// Create a new booking
  const createBooking = async (req, res) => {

    let totalAmount = req.body.totalAmount;

    if (Array.isArray(totalAmount)) {
      // Filter out empty strings and take the first valid value
      const validAmounts = totalAmount.filter(amount => amount !== '');
      totalAmount = validAmounts.length > 0 ? validAmounts[0] : '0';
    }

    const {
      fullName,
      email,
      billingMobile,
      billingAddress,
      eventDate,
      eventTime,
      venue,
      packageId,
      bookingStatus,
      paymentMethod,
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      bankReceiptRef,
      notes
    } = req.body;

    let bankReceiptImage = null;
    if (req.file) {
      bankReceiptImage = req.file.path; // Path to the uploaded image
    }

    try {
      console.log('Received booking data:', req.body);
      // Validate required fields
      if (!fullName || !email || !billingMobile || !eventDate || !packageId || !totalAmount || !paymentMethod) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          requiredFields: ['fullName', 'email', 'billingMobile', 'eventDate', 'packageId', 'totalAmount', 'paymentMethod']
        });
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
  
      // Validate mobile number format (assuming 10-digit)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(billingMobile)) {
        return res.status(400).json({ error: 'Invalid mobile number format' });
      }
  
      // Validate event date (not in the past)
      const eventDateObj = new Date(eventDate);
      if (eventDateObj < new Date()) {
        return res.status(400).json({ error: 'Event date cannot be in the past' });
      }
  
      // Validate amount
      if (isNaN(totalAmount) || totalAmount <= 0) {
        return res.status(400).json({ error: 'Invalid total amount' });
      }
  
      // Validate payment method and associated fields
      if (paymentMethod === 'creditCard') {
        if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
          return res.status(400).json({ 
            error: 'Credit card details are required for credit card payments',
            requiredFields: ['cardNumber', 'cardholderName', 'expiryDate', 'cvv']
          });
        }
  
        // Validate card number (16 digits)
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
          return res.status(400).json({ error: 'Invalid card number format' });
        }
  
        // Validate expiry date format (MM/YY or MM/YYYY)
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/.test(expiryDate)) {
          return res.status(400).json({ error: 'Invalid expiry date format (MM/YY or MM/YYYY)' });
        }
  
        // Validate CVV (3 or 4 digits)
        if (!/^\d{3,4}$/.test(cvv)) {
          return res.status(400).json({ error: 'Invalid CVV format' });
        }
      } else if (paymentMethod === 'bankTransfer') {
        if (!bankReceiptRef) {
          return res.status(400).json({ 
            error: 'Bank transfer reference number is required',
            requiredFields: ['bankReceiptRef']
          });
        }
        // Make receipt image optional or provide more helpful error
        if (!bankReceiptImage) {
          console.warn('No receipt image uploaded for bank transfer');
        }
      }
  
      let newCreditCardId = null;
      let newDepositId = null;

      // Check if customer already exists with the same name and email
      const checkExistingCustomerQuery = 'SELECT customerId FROM Customers WHERE email = ? LIMIT 1';
      const existingCustomer = await queryDatabase(checkExistingCustomerQuery, [email]);

      let newCustomerId;
      let paymentStatus = 'Pending';

      if (existingCustomer && existingCustomer.length > 0) {
        // Use existing customer's ID
        newCustomerId = existingCustomer[0].customerId;
      } else {
        // Customer doesn't exist, create a new one
        // First, get the last customer ID
        const lastCustomerQuery = 'SELECT customerId FROM Customers ORDER BY customerId DESC LIMIT 1';
        const lastCustomer = await queryDatabase(lastCustomerQuery);
        
        // Generate new customer ID (increment from last one or start at 1)
        newCustomerId = lastCustomer.length > 0 ? lastCustomer[0].customerId + 1 : 1;

        // get the user id from the email
        const getUserIdQuery = 'SELECT userID FROM user WHERE email = ? LIMIT 1';
        const userIdResult = await queryDatabase(getUserIdQuery, [email]);
        const userId = userIdResult.length > 0 ? userIdResult[0].userID : null;

        // Insert new customer
        const customerQuery = 'INSERT INTO Customers (customerId, fullName, email, billingMobile, billingAddress, userID) VALUES (?, ?, ?, ?, ?, ?)';
        const customerResult = await queryDatabase(customerQuery, [newCustomerId, fullName, email, billingMobile, billingAddress, userId]);

        if (!customerResult || !customerResult.affectedRows) {
          throw new Error('Failed to insert customer');
        }
      }
  
      // Check if the credit card details are provided
      if (paymentMethod === 'creditCard' && cardNumber && cardholderName && expiryDate && cvv) {
        paymentStatus = 'Completed';
        const lastCreditCardQuery = 'SELECT creditCardId FROM creditCard ORDER BY creditCardId DESC LIMIT 1';
        const lastCreditCard = await queryDatabase(lastCreditCardQuery);
        newCreditCardId = lastCreditCard.length > 0 ? lastCreditCard[0].creditCardId + 1 : 1;
        
        const creditCardQuery = 'INSERT INTO creditCard (creditCardId, customerId, cardholderName, cardNumber, expiryDate, cvv) VALUES (?, ?, ?, ?, ?, ?)';
        const creditCardResult = await queryDatabase(creditCardQuery, [newCreditCardId, newCustomerId, cardholderName, cardNumber, expiryDate, cvv]);
        
        if (!creditCardResult || !creditCardResult.affectedRows) {
          throw new Error('Failed to insert credit card');
        }
      }
    
      // Check if the bank deposit details are provided
      if (paymentMethod === 'bankTransfer' && bankReceiptRef) {
        paymentStatus = 'Pending';
        const lastDepositQuery = 'SELECT bankDepositId FROM bankdeposits ORDER BY bankDepositId DESC LIMIT 1';
        const lastDeposit = await queryDatabase(lastDepositQuery);
        newDepositId = lastDeposit.length > 0 ? lastDeposit[0].bankDepositId + 1 : 1;
        
        const depositQuery = 'INSERT INTO bankDeposits (bankDepositId, referenceNo, depositAmount, receiptImage) VALUES (?, ?, ?, ?)';
        const depositResult = await queryDatabase(depositQuery, [
          newDepositId, 
          bankReceiptRef, 
          totalAmount, 
          bankReceiptImage // This now contains the path to the uploaded file
        ]);
        
        if (!depositResult || !depositResult.affectedRows) {
          throw new Error('Failed to insert bank deposit');
        }
      }

      // Insert new booking
      const lastBookingQuery = 'SELECT bookingId FROM booking ORDER BY bookingId DESC LIMIT 1';
      const lastBooking = await queryDatabase(lastBookingQuery);
      const newBookingId = lastBooking.length > 0 ? lastBooking[0].bookingId + 1 : 1;
      
      const bookingQuery = `INSERT INTO booking (bookingId, customerId, packageId, eventDate, eventTime, venue, bookingStatus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const bookingResult = await queryDatabase(bookingQuery, [newBookingId, newCustomerId, packageId, eventDate, eventTime, venue,  bookingStatus, notes]);
      
      if (!bookingResult || !bookingResult.affectedRows) {
        throw new Error('Failed to insert booking');
      }
  
      // Insert into payment table
      const lastPaymentQuery = 'SELECT paymentId FROM payment ORDER BY paymentId DESC LIMIT 1';
      const lastPayment = await queryDatabase(lastPaymentQuery);
      const newPaymentId = lastPayment.length > 0 ? lastPayment[0].paymentId + 1 : 1;
      console.log('bankDepositId:', newDepositId);
      const paymentQuery = `INSERT INTO payment (paymentId, bookingId, paymentAmount, paymentDate, paymentMethod, bankDepositId, creditCardId, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const paymentResult = await queryDatabase(paymentQuery, [
        newPaymentId, 
        newBookingId, 
        totalAmount, 
        new Date(), 
        paymentMethod, 
        paymentMethod === 'bankTransfer' ? newDepositId : null, 
        paymentMethod === 'creditCard' ? newCreditCardId : null, 
        paymentStatus
      ]);
      
      if (!paymentResult || !paymentResult.affectedRows) {
        throw new Error('Failed to insert payment');
      }
  
      // Return success response
      res.status(201).json({ 
        message: 'Booking created successfully',
        bookingId: newBookingId,
        customerId: newCustomerId,
        paymentId: newPaymentId,
        bookingDetails: {
          fullName,
          email,
          eventDate,
          eventTime,
          venue,
          packageId,
          totalAmount,
          bookingStatus: bookingStatus
        }
      });
      
    } catch (error) {
      console.error('Error in createBooking:', error);
      
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry detected' });
      }
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Referenced record does not exist' });
      }
      
      // Handle custom validation errors
      if (error.message.includes('Failed to insert')) {
        return res.status(500).json({ error: 'Database operation failed', details: error.message });
      }
      
      // Generic error response
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // Get bookings for calendar display
const getCalendarBookings = async (req, res) => {
  try {
    // Optional query parameters for filtering by month/year
    const { month, year } = req.query;
    
    let query = `
      SELECT 
        b.bookingId, 
        b.eventDate, 
        b.eventTime, 
        b.venue, 
        b.bookingStatus, 
        b.bookingType,
        c.fullName,
        p.packageName, 
        p.coverageHours, 
        e.eventName
      FROM Booking b
      JOIN Customers c ON b.customerId = c.customerId
      LEFT JOIN Package p ON b.packageId = p.packageId
      LEFT JOIN Event e ON p.eventId = e.eventId
      WHERE b.bookingStatus IN ('Pending', 'Confirmed')
    `;
    
    const queryParams = [];
    
    // Add date filtering if month and year are provided
    if (month !== undefined && year !== undefined) {
      // MySQL MONTH() and YEAR() functions extract month and year from date
      query += ` AND MONTH(b.eventDate) = ? AND YEAR(b.eventDate) = ?`;
      queryParams.push(parseInt(month) + 1); // JavaScript months are 0-indexed, MySQL is 1-indexed
      queryParams.push(parseInt(year));
    }
    
    query += ` ORDER BY b.eventDate`;
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching calendar bookings:', err);
        return res.status(500).json({ error: 'Failed to fetch calendar bookings' });
      }
      
      // Transform dates to ISO format for easier handling on the frontend
      const formattedResults = results.map(booking => ({
        ...booking,
        eventDate: booking.eventDate instanceof Date ? 
          booking.eventDate.toISOString() : booking.eventDate
      }));
      
      res.json(formattedResults);
    });
  } catch (error) {
    console.error('Error in getCalendarBookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get bookings by specific date
const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate the date format (YYYY-MM-DD)
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    // First check if any bookings exist for the specified date
    const checkQuery = `
      SELECT COUNT(*) as bookingCount
      FROM booking
      WHERE DATE(eventDate) = DATE(?)
      AND bookingStatus IN ('pending', 'confirmed')
    `;
    
    db.query(checkQuery, [date], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking for bookings:', checkErr);
        return res.status(500).json({ error: 'Failed to check for bookings' });
      }
      
      // Get the count of bookings for this date
      const bookingCount = checkResult[0]?.bookingCount || 0;
      
      // If no bookings exist, return an empty array with hasBookings: false
      if (bookingCount === 0) {
        return res.json({ 
          bookings: [],
          hasBookings: false,
          count: 0
        });
      }
      
      // If bookings exist, fetch the full booking details
      const query = `
        SELECT b.*, c.fullName, c.email, c.billingAddress, c.billingMobile,
               p.packageName, p.coverageHours, e.eventName
        FROM Booking b
        JOIN Customers c ON b.customerId = c.customerId
        LEFT JOIN Package p ON b.packageId = p.packageId
        LEFT JOIN Event e ON p.eventId = e.eventId
        WHERE DATE(b.eventDate) = DATE(?)
        AND b.bookingStatus IN ('Pending', 'Confirmed')
        ORDER BY b.eventTime
      `;
      
      db.query(query, [date], (err, results) => {
        if (err) {
          console.error('Error fetching bookings by date:', err);
          return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        
        // Transform dates to ISO format for easier handling on the frontend
        const formattedResults = results.map(booking => ({
          ...booking,
          eventDate: booking.eventDate instanceof Date ? 
            booking.eventDate.toISOString().split('T')[0] : booking.eventDate
        }));
        
        // Return bookings with explicit hasBookings flag for notification display
        res.json({
          bookings: formattedResults,
          hasBookings: formattedResults.length > 0,
          count: formattedResults.length
        });
      });
    });
  } catch (error) {
    console.error('Error in getBookingsByDate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBookingDates = async (req, res) => { 
  try{
    const query = `
      SELECT bookingId, eventDate, eventTime 
      FROM booking 
      WHERE bookingStatus IN ('Pending', 'Confirmed') 
      AND eventDate IS NOT NULL 
      AND eventDate != ''
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching booking dates:', err);
        return res.status(500).json({ error: 'Failed to fetch booking dates' });
      }
      res.json(results);
    });

  }catch(error){
    console.error('Error in getBookingDates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Cancel a booking (changes status to 'Cancelled' without deleting)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the booking exists
    const checkQuery = 'SELECT * FROM booking WHERE bookingId = ?';
    const existingBooking = await queryDatabase(checkQuery, [id]);
    
    if (existingBooking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update booking status to 'Cancelled'
    const updateQuery = 'UPDATE booking SET bookingStatus = ? WHERE bookingId = ?';
    
    await queryDatabase(updateQuery, ['Cancelled', id]);
    
    res.json({
      message: 'Booking cancelled successfully',
      bookingId: id,
      status: 'Cancelled'
    });
    
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

export {
  getAllBookings,
  deleteBooking,
  updateBooking,
  createBooking,
  getCalendarBookings,
  getBookingsByDate,
  createPendingBooking,
  getBookingDates,
  getBookingByUserId,
  cancelBooking
};