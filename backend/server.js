import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import dotenv from 'dotenv';
import { data } from 'react-router';
import userRouter from './routes/userRoute.js';
import 'dotenv/config';
import packageRouter from './routes/packageRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import customerRouter from './routes/customerRoutes.js';
import paymentRouter from './routes/paymentRouter.js';
import cron from 'node-cron';
import cleanupPencilBookings from './controllers/cleanup-bookings.js';
import emailRouter from './routes/emailRoutes.js';
import homeRouter from './routes/homeRouter.js';
import driveRouter from './routes/driveRoutes.js';
import { initScheduler, sendDailySummaryEmail } from './utils/scheduler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// app config
dotenv.config();
const app = express();
// define the port number
const port = process.env.PORT;

// Create uploads directories if they don't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
const receiptsDir = path.join(__dirname, 'uploads', 'receipts');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
}

// middleware
app.use(express.json());
app.use(cors());    // access backend from frontend
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// api end ponits
app.use('/api/user', userRouter);

app.use('/api/packages', packageRouter)

app.use('/api/bookings', bookingRouter);

app.use('/api/customers', customerRouter);

app.use('/api/email', emailRouter);

app.use('/api/home', homeRouter);

app.use('/api/drive', driveRouter);

app.use('/api/payments', paymentRouter);

// request the data from the server
app.get("/", (req, res) => {
    res.send("API Working")
});

app.get('/user', (req, res)=>{
    const sql = "SELECT * FROM user";
    db.query(sql, (err, data) => {
        if(err) return res.jason(err);
        return res.json(data);
    })
})

// Schedule task to run at midnight every day
cron.schedule('0 0 * * *', () => {
    cleanupPencilBookings();
});

// Schedule task to send daily booking summary at 6:00 PM every day
// cron.schedule('0 23 * * *', () => {
//     console.log('Running scheduled daily booking summary task...');
//     sendDailySummaryEmail()
//         .then(result => {
//             console.log('Daily booking summary email result:', result);
//         })
//         .catch(err => {
//             console.error('Error sending daily booking summary:', err);
//         });
// });

// to run the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    
    // // Initialize the scheduler for daily booking summary
    // initScheduler(app);
});