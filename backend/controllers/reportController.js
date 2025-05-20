import db from "../config/db.js";

// Get monthly booking and payment statistics
export const getMonthlyStats = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    let timeFrame;
    switch (range) {
      case 'week':
        timeFrame = 'WEEK';
        break;
      case 'quarter':
        timeFrame = 'QUARTER';
        break;
      case 'year':
        timeFrame = 'YEAR';
        break;
      default:
        timeFrame = 'MONTH';
    }
    
    const query = `
      SELECT 
        DATE_FORMAT(b.eventDate, '%b') as month,
        COUNT(DISTINCT b.bookingId) as bookings,
        COUNT(DISTINCT p.paymentId) as payments,
        COALESCE(SUM(p.paymentAmount), 0) as revenue
      FROM 
        booking b
      LEFT JOIN 
        payment p ON b.bookingId = p.bookingId
      WHERE 
        b.eventDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 ${timeFrame})
      GROUP BY 
        DATE_FORMAT(b.eventDate, '%b')
      ORDER BY 
        MIN(b.eventDate)
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching monthly statistics:', err);
        return res.status(500).json({ error: 'Failed to fetch monthly statistics' });
      }
      
      return res.json(results);
    });
  } catch (error) {
    console.error("Error fetching monthly statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get payment method breakdown
export const getPaymentMethods = async (req, res) => {
  try {
    const query = `
      SELECT 
        paymentMethod as name,
        COUNT(*) as value
      FROM 
        payment
      GROUP BY 
        paymentMethod
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching payment methods:', err);
        return res.status(500).json({ error: 'Failed to fetch payment methods' });
      }
      
      return res.json(results);
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get detailed bookings for reports
export const getDetailedBookings = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    let timeFrame;
    switch (range) {
      case 'week':
        timeFrame = 'WEEK';
        break;
      case 'quarter':
        timeFrame = 'QUARTER';
        break;
      case 'year':
        timeFrame = 'YEAR';
        break;
      default:
        timeFrame = 'MONTH';
    }
    
    const query = `
      SELECT 
        b.bookingId as id,
        c.fullName as customerName,
        c.billingMobile,
        b.eventDate as date,
        p.investment as amount,
        b.bookingStatus as status,
      FROM 
        booking b
      JOIN 
        Customers c ON b.customerId = c.customerId
      LEFT JOIN 
        Package p ON b.packageId = p.packageId
      WHERE 
        b.createdAt >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 ${timeFrame})
      ORDER BY 
        b.createdAt DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching detailed bookings:', err);
        return res.status(500).json({ error: 'Failed to fetch detailed bookings' });
      }
      
      const formattedResults = results.map(booking => ({
        ...booking,
        checkIn: booking.checkIn instanceof Date ? 
          booking.checkIn.toISOString().split('T')[0] : booking.checkIn,
        checkOut: booking.checkOut instanceof Date ? 
          booking.checkOut.toISOString().split('T')[0] : booking.checkOut,
        date: booking.date instanceof Date ? 
          booking.date.toISOString() : booking.date
      }));
      
      return res.json(formattedResults);
    });
  } catch (error) {
    console.error("Error fetching detailed bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get detailed payments for reports
export const getDetailedPayments = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    let timeFrame;
    switch (range) {
      case 'week':
        timeFrame = 'WEEK';
        break;
      case 'quarter':
        timeFrame = 'QUARTER';
        break;
      case 'year':
        timeFrame = 'YEAR';
        break;
      default:
        timeFrame = 'MONTH';
    }
    
    const query = `
      SELECT 
        p.paymentId as id,
        p.bookingId,
        c.fullName as customerName,
        p.paymentDate as date,
        p.paymentAmount as amount,
        p.paymentMethod as method,
        p.paymentStatus as status
      FROM 
        payment p
      JOIN 
        booking b ON p.bookingId = b.bookingId
      JOIN 
        Customers c ON b.customerId = c.customerId
      WHERE 
        p.paymentDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 ${timeFrame})
      ORDER BY 
        p.paymentDate DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching detailed payments:', err);
        return res.status(500).json({ error: 'Failed to fetch detailed payments' });
      }
      
      const formattedResults = results.map(payment => ({
        ...payment,
        date: payment.date instanceof Date ? 
          payment.date.toISOString() : payment.date
      }));
      
      return res.json(formattedResults);
    });
  } catch (error) {
    console.error("Error fetching detailed payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
