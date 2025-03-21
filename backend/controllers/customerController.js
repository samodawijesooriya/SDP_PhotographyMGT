import db from '../config/db.js'; // Adjust the path as necessary
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

// create a tokem
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'randomstring', { expiresIn: '1h' });
};

// register user
const registerCustomer = async (req, res) => {
    const { customerId, fullName, billingAddress, email, billingMobile } = req.body;
    const role = 'customer';

    try {
        // Check if the user already exists
        const sqlCheck = 'SELECT * FROM customers WHERE customerId = ?';
        db.query(sqlCheck, [customerId], async (err, results) => {
            if (err) {
                return res.json({ success: false, message: "An error occurred while checking for existing user" });
            }
            if (results.length > 0) {
                return res.json({ success: false, message: "Customer already exists" });
            }

            // Validate email format and password strength
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Invalid email format" });
            }
        
            // validate the mobile number
            if (!validator.isMobilePhone(billingMobile, 'en-IN')) {
                return res.json({ success: false, message: "Invalid mobile number" });
            }

            // Insert new user
            const sqlInsert = 'INSERT INTO customers (customerId, fullName, billingAddress, email, billingMobile) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sqlInsert, [customerId, fullName, billingAddress, email, billingMobile], (err, user) => {
                if (err) {
                    return res.json({ success: false, message: "An error occurred while creating the Customer" });
                }

                // Create a token
                const token = createToken(customerId);
                res.json({
                    success: true,
                    token: token,
                    user: {
                        username: username,
                        email: email,
                        role: role
                    }
                });
            });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "An error occurred" });
    }
};

const getAllCustomers = async(req, res) => {
    try {
        const query = 'SELECT * FROM customers';
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).send({
                    message: "An error occurred while retrieving Customers."
                });
            }
            res.status(200).send(results);
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving Customers."
        });
    }
};

const updateCustomer = async (req, res) => {
    
    try {
        console.log("Request params:", req.params);
        const { id } = req.params;  // Corrected parameter extraction
        console.log("Updating Customer with ID:", id);  

        const query = "UPDATE customer SET fullName=?, billingAddress=?, email=?, billingMobile=? WHERE customerId=?";
        const values = [req.body.fullName, req.body.billingAddress, req.body.email, req.body.billingMobile, id];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error updating Customer:", err);
                return res.status(500).json({ error: "Failed to update Customer" });
            }
            
            if (result.affectedRows === 0) {
                console.warn("Customer not found:", id);
                return res.status(404).json({ error: "Customer not found" });
            }

            res.status(200).json({ message: "Customer updated successfully" });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM customers WHERE customerId = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error deleting customer:", err);
            return res.status(500).json({ error: "Failed to delete customer" });
        }
        
        if (result.affectedRows === 0) {
            console.warn("Customer not found:", id);
            return res.status(404).json({ error: "Customer not found" });
        }

        res.status(200).json({ message: "Customer deleted successfully" });
    });
}


export {
    registerCustomer,
    getAllCustomers,
    deleteCustomer,
    updateCustomer,
}