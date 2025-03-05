// controllers/packageController.js
import db from '../config/db.js';


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
    Customer c ON b.customerId = c.customerId
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
        paymentStatus = 'Completed'
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
        
        // Next, delete related payments (due to foreign key constraints)
        const deletePaymentsQuery = 'DELETE FROM Payments WHERE bookingId = ?';
        
        db.query(deletePaymentsQuery, [id], (paymentErr) => {
          if (paymentErr) {
            console.error('Error deleting related payments:', paymentErr);
            return res.status(500).json({ error: 'Failed to delete related payments' });
          }
          
          // Finally, delete the booking
          const deleteBookingQuery = 'DELETE FROM booking WHERE bookingId = ?';
          
          db.query(deleteBookingQuery, [id], (err, results) => {
            if (err) {
              console.error('Error deleting booking:', err);
              return res.status(500).json({ error: 'Failed to delete booking' });
            }
            
            if (results.affectedRows === 0) {
              return res.status(404).json({ error: 'Booking not found or already deleted' });
            }
            
            res.json({ 
              message: 'Booking deleted successfully',
              deletedId: id
            });
          });
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
      // Customer information
      fullName,
      email,
      billingAddress,
      billingMobile,
      
      // Booking information
      eventDate,
      eventTime,
      venue,
      bookingStatus,
      bookingType,
      notes,
      packageId
    } = req.body;
    
    // Begin transaction
    db.beginTransaction(async (transErr) => {
      if (transErr) {
        console.error('Error starting transaction:', transErr);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }
      
      // First check if the booking exists and get customerId
      db.query('SELECT customerId FROM booking WHERE bookingId = ?', [id], (checkErr, bookingResults) => {
        if (checkErr) {
          return db.rollback(() => {
            console.error('Error checking booking existence:', checkErr);
            res.status(500).json({ error: 'Failed to check booking existence' });
          });
        }
        
        if (bookingResults.length === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: 'Booking not found' });
          });
        }
        
        const customerId = bookingResults[0].customerId;
        
        // Update customer information
        const updateCustomerQuery = `
          UPDATE customer SET
            fullName = ?,
            email = ?,
            billingAddress = ?,
            billingMobile = ?
          WHERE customerId = ?
        `;
        
        const customerValues = [
          fullName,
          email,
          billingAddress,
          billingMobile,
          customerId
        ];
        
        db.query(updateCustomerQuery, customerValues, (customerErr) => {
          if (customerErr) {
            return db.rollback(() => {
              console.error('Error updating customer:', customerErr);
              res.status(500).json({ error: 'Failed to update customer information' });
            });
          }
          
          // Update the booking
          const updateBookingQuery = `
            UPDATE booking SET
              eventDate = ?,
              eventTime = ?,
              venue = ?,
              bookingStatus = ?,
              bookingType = ?,
              notes = ?,
              packageId = ?
            WHERE bookingId = ?
          `;
          
          const bookingValues = [
            eventDate,
            eventTime,
            venue,
            bookingStatus,
            bookingType,
            notes,
            packageId,
            id
          ];
          
          db.query(updateBookingQuery, bookingValues, (bookingErr) => {
            if (bookingErr) {
              return db.rollback(() => {
                console.error('Error updating booking:', bookingErr);
                res.status(500).json({ error: 'Failed to update booking' });
              });
            }
            
            // Commit the transaction
            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => {
                  console.error('Error committing transaction:', commitErr);
                  res.status(500).json({ error: 'Failed to commit transaction' });
                });
              }
              
              res.json({
                message: 'Booking updated successfully',
                updatedId: id
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in updateBooking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  // Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      // Customer information
      fullName,
      email,
      billingAddress,
      billingMobile,
      
      // Booking information
      eventDate,
      eventTime,
      venue,
      bookingStatus,
      bookingType,
      notes,
      packageId
    } = req.body;
    
    // Begin transaction
    db.beginTransaction(async (transErr) => {
      if (transErr) {
        console.error('Error starting transaction:', transErr);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }
      
      // First, create or find the customer
      const findCustomerQuery = 'SELECT customerId FROM Customer WHERE email = ?';
      
      db.query(findCustomerQuery, [email], (findErr, findResults) => {
        if (findErr) {
          return db.rollback(() => {
            console.error('Error finding customer:', findErr);
            res.status(500).json({ error: 'Failed to find customer' });
          });
        }
        
        let customerId;
        
        // If customer doesn't exist, create a new one
        if (findResults.length === 0) {
          const createCustomerQuery = `
            INSERT INTO Customer (fullName, email, billingAddress, billingMobile)
            VALUES (?, ?, ?, ?)
          `;
          
          const customerValues = [fullName, email, billingAddress, billingMobile];
          
          db.query(createCustomerQuery, customerValues, (createErr, createResults) => {
            if (createErr) {
              return db.rollback(() => {
                console.error('Error creating customer:', createErr);
                res.status(500).json({ error: 'Failed to create customer' });
              });
            }
            
            customerId = createResults.insertId;
            createBookingRecord(customerId);
          });
        } else {
          // Customer exists, update their information and use their ID
          customerId = findResults[0].customerId;
          
          const updateCustomerQuery = `
            UPDATE Customer SET
              fullName = ?,
              billingAddress = ?,
              billingMobile = ?
            WHERE customerId = ?
          `;
          
          const customerValues = [fullName, billingAddress, billingMobile, customerId];
          
          db.query(updateCustomerQuery, customerValues, (updateErr) => {
            if (updateErr) {
              return db.rollback(() => {
                console.error('Error updating customer:', updateErr);
                res.status(500).json({ error: 'Failed to update customer' });
              });
            }
            
            createBookingRecord(customerId);
          });
        }
        
        // Helper function to create the booking record
        function createBookingRecord(customerId) {
          const createBookingQuery = `
            INSERT INTO Booking (
              customerId,
              packageId,
              eventDate,
              eventTime,
              venue,
              bookingStatus,
              bookingType,
              notes,
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const bookingValues = [
            customerId,
            packageId,
            eventDate,
            eventTime,
            venue,
            bookingStatus || 'Pending',
            bookingType,
            notes
          ];
          
          db.query(createBookingQuery, bookingValues, (bookingErr, bookingResults) => {
            if (bookingErr) {
              return db.rollback(() => {
                console.error('Error creating booking:', bookingErr);
                res.status(500).json({ error: 'Failed to create booking' });
              });
            }
            
            const bookingId = bookingResults.insertId;
            
            // Commit the transaction
            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => {
                  console.error('Error committing transaction:', commitErr);
                  res.status(500).json({ error: 'Failed to commit transaction' });
                });
              }
              
              // Fetch the complete booking information with joined tables
              const getBookingQuery = `
                SELECT b.*, c.fullName, c.email, c.billingAddress, c.billingMobile,
                       p.packageName, p.coverageHours, e.eventName
                FROM Booking b
                JOIN Customer c ON b.customerId = c.customerId
                LEFT JOIN Package p ON b.packageId = p.packageId
                LEFT JOIN Event e ON p.eventId = e.eventId
                WHERE b.bookingId = ?
              `;
              
              db.query(getBookingQuery, [bookingId], (getErr, getResults) => {
                if (getErr) {
                  console.error('Error fetching created booking:', getErr);
                  return res.status(201).json({
                    message: 'Booking created successfully, but details could not be retrieved',
                    bookingId: bookingId
                  });
                }
                
                res.status(201).json({
                  message: 'Booking created successfully',
                  bookingId: bookingId,
                  booking: getResults[0]
                });
              });
            });
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      JOIN Customer c ON b.customerId = c.customerId
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
        JOIN Customer c ON b.customerId = c.customerId
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

  export {
    getAllBookings,
    deleteBooking,
    updateBooking,
    createBooking,
    getCalendarBookings,
    getBookingsByDate
  };