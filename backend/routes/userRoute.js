import express, { Router } from 'express';
import { registerUser, loginUser, getAllUsers, createUser, deleteUser, updateUser, resendOTP, verifyEmail, getUserById, updateUserProfile, changePassword } from '../controllers/userController.js';

// add router
const userRouter = express.Router();

// // data of the user
// userRouter.post("/register", registerUser);

// end point for login
userRouter.post("/login", loginUser);

// get all users
userRouter.get('/allusers', getAllUsers);

// get user by id
userRouter.get('/:userId',getUserById );

// user apis for profile
userRouter.get('/profile/:userId', getUserById);

// update user profile
userRouter.put('/profile', updateUserProfile);

//create a new user
userRouter.post('/create', createUser);

//delete user
userRouter.delete('/:userId', deleteUser);

//update user
userRouter.put("/:id", updateUser);

// verify user email with otp
userRouter.post('/verify-email', verifyEmail);

// Resend OTP
userRouter.post('/resend-otp', resendOTP);

// Change password route
userRouter.put('/change-password/:userId', changePassword);

export default userRouter;