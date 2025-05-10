import db from '../config/db.js'; // Adjust the path as necessary
import bcrypt from 'bcrypt';
import e from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';

// create a tokem
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'randomstring', { expiresIn: '1h' });
};

const registerCustomer = async (req, res) => {
    const { fullName, billingAddress, email, billingMobile, username, password } = req.body;
    const role = 'customer';
    
    try {
        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }
        
        // Check if username exists
        const checkUsername = () => {
            return new Promise((resolve, reject) => {
                const sqlCheckUsername = 'SELECT * FROM user WHERE username = ?';
                db.query(sqlCheckUsername, [username], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        };
        
        const usernameResults = await checkUsername();
        if (usernameResults.length > 0) {
            return res.json({ success: false, message: "User already exists" });
        }
        
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }
        
        // Generate new user ID
        const getUserId = () => {
            return new Promise((resolve, reject) => {
                const sqlId = 'SELECT COALESCE(MAX(userID), 0) AS maxId FROM user';
                db.query(sqlId, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0].maxId + 1);
                });
            });
        };
        
        const newId = await getUserId();
        
        // Insert new user
        const insertUser = () => {
            return new Promise((resolve, reject) => {
                const sqlInsert = 'INSERT INTO user (userID, username, email, password, role) VALUES (?, ?, ?, ?, ?)';
                db.query(sqlInsert, [newId, username, email, password, role], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        };
        
        await insertUser();
        
        // Check if customer exists
        const checkCustomer = () => {
            return new Promise((resolve, reject) => {
                const sqlCheckCustomer = 'SELECT * FROM customers WHERE email = ?';
                db.query(sqlCheckCustomer, [email], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        };
        
        const customerResults = await checkCustomer();
        if (customerResults.length > 0) {
            return res.json({ success: false, message: "Customer already exists" });
        }
        
        // Generate customer ID
        const getCustomerId = () => {
            return new Promise((resolve, reject) => {
                const sqlCustomerId = 'SELECT COALESCE(MAX(customerId), 0) AS maxId FROM customers';
                db.query(sqlCustomerId, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0].maxId + 1);
                });
            });
        };
        
        const customerId = await getCustomerId();
        
        // Insert customer
        const insertCustomer = () => {
            return new Promise((resolve, reject) => {
                const sqlInsertCustomer = 'INSERT INTO customers (customerId, fullName, billingAddress, email, billingMobile, userID) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(sqlInsertCustomer, [customerId, fullName, billingAddress, email, billingMobile, newId], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        };
        
        await insertCustomer();
        console.log("Customer created successfully!");
        
        // Create token and send response
        const token = createToken(customerId);
        return res.json({
            success: true,
            token: token,
            user: {
                username: username,
                email: email,
                role: role,
                userId: newId,
            }
        });
        
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "An error occurred" });
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
    const { customerId } = req.params;
    
    try {
        // First find the userID of the customer
        db.query('SELECT userID FROM customers WHERE customerId = ?', [customerId], (err, result) => {
            if (err) {
                console.error("Error finding userID:", err);
                return res.status(500).json({ error: "Failed to find customer" });
            }
            
            if (result.length === 0) {
                return res.status(404).json({ error: "Customer not found" });
            }
            
            const userId = result[0].userID;
            
            // Delete the customer first
            db.query('DELETE FROM customers WHERE customerId = ?', [customerId], (err) => {
                if (err) {
                    console.error("Error deleting customer:", err);
                    return res.status(500).json({ error: "Failed to delete customer" });
                }
                
                // Then delete the user after customer is deleted
                db.query('DELETE FROM user WHERE userID = ?', [userId], (err) => {
                    if (err) {
                        console.error("Error deleting user:", err);
                        return res.status(500).json({ error: "Failed to delete user" });
                    }
                    
                    return res.status(200).json({ message: "Customer and associated user deleted successfully" });
                });
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


export {
    registerCustomer,
    getAllCustomers,
    deleteCustomer,
    updateCustomer,
}