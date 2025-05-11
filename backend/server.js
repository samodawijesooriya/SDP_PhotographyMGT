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
import cron from 'node-cron';
import cleanupPencilBookings from './controllers/cleanup-bookings.js';
import emailRouter from './routes/emailRoutes.js';
import homeRouter from './routes/homeRouter.js';

// app config
dotenv.config();
const app = express();
// define the port number
const port = process.env.PORT;

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

// to run the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});