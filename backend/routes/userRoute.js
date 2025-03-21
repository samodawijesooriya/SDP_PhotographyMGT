import express, { Router } from 'express';
import { registerUser, loginUser, getAllUsers, createUser, deleteUser, updateUser  } from '../controllers/userController.js';

// add router
const userRouter = express.Router();

// data of the user
userRouter.post("/register", registerUser);

// end point for login
userRouter.post("/login", loginUser);

// get all users
userRouter.get('/allusers', getAllUsers);

//create a new user
userRouter.post('/create', createUser);

//delete user
userRouter.delete('/:userId', deleteUser);

//update user
userRouter.put("/:id", updateUser);



export default userRouter;