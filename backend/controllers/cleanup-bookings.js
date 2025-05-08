import db from '../config/db.js';

async function cleanupPencilBookings() {
  try {
    console.log('Running scheduled cleanup of Pencil bookings...');
    
    // Calculate date 7 days ago
    const date = new Date();
    console.log('Current date:', date.toISOString());
    date.setDate(date.getDate() - 7);
    const oneWeekAgo = date.toISOString().split('T')[0];
    console.log('Date 7 days ago:', oneWeekAgo);
    // Use the correct promise-based method for mysql2
    const [outdatedBookings] = await db.promise().query(
      `SELECT bookingId, customerId FROM booking 
       WHERE bookingStatus = 'pencil' 
       AND createdAt < ?`,
      [oneWeekAgo]
    );
    
    console.log('Result type:', typeof outdatedBookings);
    console.log('Result:', outdatedBookings);
    console.log(`Found ${outdatedBookings.length} outdated Pencil bookings`);
    
    if (outdatedBookings.length > 0) {
      console.log(`Found ${outdatedBookings.length} outdated Pencil bookings to remove`);
      
      for (const booking of outdatedBookings) {
        await db.promise().query('DELETE FROM booking WHERE bookingId = ?', [booking.bookingId]);
        console.log(`Removed outdated Pencil booking ID: ${booking.bookingId} for: ${booking.fullName}`);
      }
      
      console.log('Cleanup completed successfully');
      return outdatedBookings.length;
    } else {
      console.log('No outdated Pencil bookings found');
      return 0;
    }
  } catch (error) {
    console.error('Error during Pencil bookings cleanup:', error);
    throw error;
  }
}

export default cleanupPencilBookings;