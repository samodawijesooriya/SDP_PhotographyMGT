// controllers/packageController.js
import db from '../config/db.js';


// Get all bookings with package information
const getAllBookings = async (req, res) => {  
    try {
      const query = `
        SELECT b.*, p.packageName, p.coverageHours, e.eventName
        FROM booking b
        LEFT JOIN package p ON b.packageId = p.packageId
        LEFT JOIN event e ON p.eventId = e.eventId
        ORDER BY b.eventDate DESC
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
        fullName,
        email,
        billingAddress,
        billingMobile,
        eventDate,
        eventTime,
        venue,
        bookingStatus,
        bookingType,
        totalAmount,
        paidAmount,
        notes
      } = req.body;
      
      // First check if the booking exists
      const checkQuery = 'SELECT * FROM booking WHERE bookingId = ?';
      
      db.query(checkQuery, [id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Error checking booking existence:', checkErr);
          return res.status(500).json({ error: 'Failed to check booking existence' });
        }
        
        if (checkResults.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        
        // Update the booking
        const updateQuery = `
          UPDATE booking SET
            fullName = ?,
            email = ?,
            billingAddress = ?,
            billingMobile = ?,
            eventDate = ?,
            eventTime = ?,
            venue = ?,
            bookingStatus = ?,
            bookingType = ?,
            totalAmount = ?,
            paidAmount = ?,
            notes = ?
          WHERE bookingId = ?
        `;
        
        const values = [
          fullName,
          email,
          billingAddress,
          billingMobile,
          eventDate,
          eventTime,
          venue,
          bookingStatus,
          bookingType,
          totalAmount,
          paidAmount,
          notes,
          id
        ];
        
        db.query(updateQuery, values, (err, results) => {
          if (err) {
            console.error('Error updating booking:', err);
            return res.status(500).json({ error: 'Failed to update booking' });
          }
          
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found or no changes made' });
          }
          
          res.json({
            message: 'Booking updated successfully',
            updatedId: id
          });
        });
      });
    } catch (error) {
      console.error('Error in updateBooking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const createBooking = async (req, res) => {
    try {
      const {
        fullName,
        email,
        billingAddress,
        billingMobile,
        eventDate,
        eventTime,
        venue,
        bookingStatus,
        bookingType,
        totalAmount,
        paidAmount,
        notes,
        packageName,
        eventName,
        coverageHours
      } = req.body;
  
      // Insert the new booking
      const createQuery = `
        INSERT INTO booking (
          fullName,
          email,
          billingAddress,
          billingMobile,
          eventDate,
          eventTime,
          venue,
          bookingStatus,
          bookingType,
          totalAmount,
          paidAmount,
          notes,
          packageName,
          eventName,
          coverageHours,
          createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
  
      const values = [
        fullName,
        email,
        billingAddress,
        billingMobile,
        eventDate,
        eventTime,
        venue,
        bookingStatus || 'pending',
        bookingType || 'pencil',
        totalAmount,
        paidAmount,
        notes,
        packageName,
        eventName,
        coverageHours
      ];
  
      db.query(createQuery, values, (err, results) => {
        if (err) {
          console.error('Error creating booking:', err);
          return res.status(500).json({ error: 'Failed to create booking' });
        }
  
        res.status(201).json({
          message: 'Booking created successfully',
          bookingId: results.insertId,
          booking: {
            bookingId: results.insertId,
            fullName,
            email,
            billingAddress,
            billingMobile,
            eventDate,
            eventTime,
            venue,
            bookingStatus: bookingStatus || 'pending',
            bookingType: bookingType || 'pencil',
            totalAmount,
            paidAmount,
            notes,
            packageName,
            eventName,
            coverageHours,
            createdAt: new Date()
          }
        });
      });
    } catch (error) {
      console.error('Error in createBooking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  export {
    getAllBookings,
    deleteBooking,
    updateBooking,
    createBooking
  };