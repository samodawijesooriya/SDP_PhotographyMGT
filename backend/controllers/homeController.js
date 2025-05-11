import db from "../config/db.js";

const getBookingStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(CASE WHEN bookingStatus = 'Confirmed' THEN 1 ELSE 0 END) as confirmedCount,
        SUM(CASE WHEN bookingStatus = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN bookingStatus = 'Pencil' THEN 1 ELSE 0 END) as pencilCount,
        COUNT(*) as totalCount
      FROM booking
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching booking statistics:', err);
        return res.status(500).json({ error: 'Failed to fetch booking statistics' });
      }
      return res.json(results[0]);
    });
  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get upcoming bookings for next 7 days
const getUpcomingBookings = async (req, res) => {
  try {
    // Get today's date and the date 7 days from now
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedSevenDaysLater = sevenDaysLater.toISOString().split('T')[0];
    
    const query = `
      SELECT 
        b.bookingId, 
        b.eventDate, 
        b.eventTime, 
        b.venue, 
        b.bookingStatus,
        c.fullName,
        p.packageName, 
        e.eventName
      FROM 
        booking b
      JOIN 
        Customers c ON b.customerId = c.customerId
      LEFT JOIN 
        Package p ON b.packageId = p.packageId
      LEFT JOIN 
        Event e ON p.eventId = e.eventId
      WHERE 
        b.eventDate BETWEEN ? AND ?
        AND b.bookingStatus IN ('Pending', 'Confirmed')
      ORDER BY 
        b.eventDate, b.eventTime
    `;
    
    db.query(query, [formattedToday, formattedSevenDaysLater], (err, results) => {
      if (err) {
        console.error('Error fetching upcoming bookings:', err);
        return res.status(500).json({ error: 'Failed to fetch upcoming bookings' });
      }
      
      // Format dates for easier handling on the frontend
      const formattedResults = results.map(booking => ({
        ...booking,
        eventDate: booking.eventDate instanceof Date ? 
          booking.eventDate.toISOString().split('T')[0] : booking.eventDate
      }));
      
      return res.json(formattedResults);
    });
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get counts and revenue summary
const getSummaryStats = async (req, res) => {
    try {
        const query = `
            SELECT 
            (SELECT COUNT(*) FROM Customers) as customerCount,
            (SELECT COUNT(*) FROM Package) as packageCount,
            (SELECT COALESCE(SUM(paymentAmount), 0) FROM payment) as totalRevenue,
            (SELECT COALESCE(SUM(paymentAmount), 0) 
             FROM payment 
             WHERE MONTH(paymentDate) = MONTH(CURRENT_DATE())
             AND YEAR(paymentDate) = YEAR(CURRENT_DATE())) as thisMonthRevenue
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching summary statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch summary statistics' });
            }
            return res.json(results[0]);
        });
    } catch (error) {
        console.error("Error fetching summary statistics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getNewBookings = async (req, res) => {
    try {
        // get the booking that is created one hour ago

        const query = `
            SELECT
                b.bookingId, 
                b.eventDate, 
                b.eventTime, 
                b.venue, 
                b.bookingStatus,
                c.fullName,
                p.packageName, 
                e.eventName,
                b.createdAt
            FROM
                booking b
            JOIN
                Customers c ON b.customerId = c.customerId
            LEFT JOIN   
                Package p ON b.packageId = p.packageId
            LEFT JOIN
                Event e ON p.eventId = e.eventId
            WHERE
                b.createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                AND b.bookingStatus IN ('Pending', 'Confirmed')
            ORDER BY
                b.createdAt DESC
        `;
        // Use the formatted date in the query
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching new bookings:', err);
                return res.status(500).json({ error: 'Failed to fetch new bookings' });
            }
            
            // Format dates for easier handling on the frontend
            const formattedResults = results.map(booking => ({
                ...booking,
                eventDate: booking.eventDate instanceof Date ? 
                    booking.eventDate.toISOString().split('T')[0] : booking.eventDate
            }));
            
            return res.json(formattedResults);
        });
    } catch (error) {
        console.error("Error fetching new bookings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { getBookingStats, getUpcomingBookings, getSummaryStats, getNewBookings };