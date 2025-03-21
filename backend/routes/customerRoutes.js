import express, { Router } from 'express';
import { registerCustomer, getAllCustomers, deleteCustomer, updateCustomer } from '../controllers/customerController.js';

const customerRouter = express.Router();

// register customers
customerRouter.post("/register", registerCustomer);

// get all customers
customerRouter.get('/allcustomers', getAllCustomers);

// delete customer
customerRouter.delete('/:customerId', deleteCustomer);

// update customer
customerRouter.put("/:customerId", updateCustomer);

export default customerRouter;