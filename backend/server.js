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

// app config
dotenv.config();
const app = express();
// define the port number
const port = process.env.PORT;

// middleware
app.use(express.json());
app.use(cors());    // access backend from frontend

// api end ponits
app.use('/api/user', userRouter);

app.use('/api/packages', packageRouter)

app.use('/api/bookings', bookingRouter);

app.use('/api/customers', customerRouter);

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

// to run the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});