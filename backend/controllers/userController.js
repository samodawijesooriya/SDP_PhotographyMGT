import db from '../config/db.js'; // Adjust the path as necessary
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import UserModel from '../models/userModel.js';
import { sendVerificationEmail, sendAccountCreationEmail } from '../controllers/emailController.js';

// create a tokem
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'randomstring', { expiresIn: '1h' });
};

// not needed right now

const registerUser = async (req, res) => {
    const { username, email, password} = req.body;
    const role = 'customer';

    try {
        // Check if the user already exists
        const sqlCheck = 'SELECT * FROM user WHERE username = ?';
        db.query(sqlCheck, [username], async (err, results) => {
            if (err) {
                return res.json({ success: false, message: "An error occurred while checking for existing user" });
            }
            if (results.length > 0) {
                return res.json({ success: false, message: "User already exists" });
            }

            // Validate email format and password strength
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Invalid email format" });
            }
            if (password.length < 8) {
                return res.json({ success: false, message: "Password must be at least 8 characters" });
            }

            // cannot decrypt the password (ERROR: data and hash arguments required)
            // Encrypt the password
            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(password, salt);

            // Generate new user ID
            let sqlId = 'SELECT userID FROM user ORDER BY userID DESC LIMIT 1';
            db.query(sqlId, (err, result) => {
                if (err) {
                    return res.json({ success: false, message: "An error occurred while generating a new ID" });
                }
                let newId = 1;
                if (result.length > 0) {
                    newId = result[0].userID + 1;
                }
                
                // Insert new user
                let sqlInsert = 'INSERT INTO user (userID, username, email, password, role) VALUES (?, ?, ?, ?, ?)';
                db.query(sqlInsert, [newId, username, email, password, role], (err, user) => {
                    if (err) {
                        console.log(err);
                        return res.json({ success: false, message: "An error occurred while in register user" });
                    }

                    // Create a token
                    const token = createToken(newId);
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
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "An error occurred" });
    }
};

// login user
const loginUser = async (req, res) => {
    const {username, password} = req.body;
    try {
        // Input validation
        if (!username || !password) {
            return res.json({ 
                success: false, 
                message: "Please provide both username and password" 
            });
        }

        // Find user in database
        let sqlFind = 'SELECT * FROM user WHERE username = ?';
        
        // Using a promise to handle the database query properly
        const findUser = () => {
            return new Promise((resolve, reject) => {
                db.query(sqlFind, [username], (err, results) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            });
        };
        
        const results = await findUser();
        
        // Check if user exists
        if (results.length === 0) {
            return res.json({ 
                success: false, 
                message: "No username or password" 
            });
        }

        const user = results[0];

        // Check password
        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = password === user.password; // Use the plain password for comparison
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            // Generate new OTP for verification
            const otp = generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
            
            // Using a promise for the UPDATE query as well
            const updateOTP = () => {
                return new Promise((resolve, reject) => {
                    const updateSql = 'UPDATE user SET verificationOTP = ?, verificationOTPExpiry = ? WHERE userId = ?';
                    db.query(updateSql, [otp, otpExpiry, user.id], (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });
            };
            
            try {
                await updateOTP();
                await sendVerificationEmail(user.email, otp);
                
                return res.status(200).json({
                    success: true,
                    emailVerificationRequired: true,
                    email: user.email,
                    message: 'Your email is not verified. A verification code has been sent to your email. Please verify your email to continue.'
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send verification email. Please try again later.'
                });
            }
        }

        // Generate JWT token
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.userID,
                username: user.username,
                email: user.email,
                name: user.fullName,
                role: user.role
            }
        });      
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

const getAllUsers = async(req, res) => {
    try {
        UserModel.getAllUsers((err, data) => {
            if (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving users."
                });
            } else {
                res.send(data);
            }
        });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while retrieving users."
        });
    }
}

const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const query = `
            SELECT c.fullName, c.billingMobile, c.billingAddress, u.email 
            FROM customers c 
            JOIN user u ON c.userId = u.userId 
            WHERE c.userId = ?`;
            
        db.query(query, [userId], (error, results) => {
            if (error) {
            res.status(500).send({
                message: "Error retrieving user details"
            });
            } else if (results.length === 0) {
            res.status(404).send({
                message: "User not found"
            });
            } else {
            res.send(results[0]);
            }
        });
    } catch (error) {
        res.status(500).send({
            error: error.message,
            message: "An error occurred while retrieving user details."
        });
    }  
}



// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// function to create a new user
const createUser = async (req, res) => {
    // Validate request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    try {
        // Create a User
        const { username, password, email, name, address, mobile } = req.body;
        const role = req.body.role || 'customer';
        
        // Check if the user already exists
        const sqlCheck = 'SELECT * FROM user WHERE username = ?';
        db.query(sqlCheck, [username], async (err, results) => {
            if (err) {
                return res.json({ success: false, message: "An error occurred while checking for existing user" });
            }
            if (results.length > 0) {
                return res.json({ success: false, message: "User already exists" });
            }
            

            // Generate OTP
            const otp = generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

            // Generate new user ID
            const sqlId = 'SELECT COALESCE(MAX(userID), 0) AS maxId FROM user';
            db.query(sqlId, async (err, result) => {
                if (err) {
                    return res.json({ success: false, message: "An error occurred while generating a new ID" });
                }
                const newUserId = result[0].maxId + 1;
                
                // Insert new user - fixed parameter count
                const sqlInsert = 'INSERT INTO user (userID, username, email, password, role, isEmailVerified, verificationOTP, verificationOTPExpiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                db.query(sqlInsert, [newUserId, username, email, password, role, false, otp, otpExpiry], async (err, user) => {
                    console.log("Data submited", otp);

                    if (err) {
                        return res.json({ success: false, message: "An error occurred while creating the user in create" });
                    }

                    // Get new customer ID
                    const customerIdQuery = 'SELECT COALESCE(MAX(customerId), 0) AS maxId FROM customers';
                    db.query(customerIdQuery, async (err, custResult) => {
                        if (err) {
                            return res.json({ success: false, message: "An error occurred while generating a customer ID" });
                        }
                        
                        const newCustomerId = custResult[0].maxId + 1;
                        
                        // Insert the Customer details - fixed parameter count
                        const customerInsertQuery = 'INSERT INTO customers (customerId, fullName, billingAddress, billingMobile, userId) VALUES (?, ?, ?, ?, ?)';
                        db.query(customerInsertQuery, [newCustomerId, name, address, mobile, newUserId], async (err, customer) => {
                            if (err) {
                                console.log(err);
                                return res.json({ success: false, message: "An error occurred while creating the customer" });
                            }

                            try {
                                // Send verification email
                                await sendVerificationEmail(email, otp);
                                
                                // Create a token
                                const token = createToken(newUserId);
                                
                                // Send the final response
                                return res.status(201).json({
                                    success: true,
                                    message: 'User registered successfully. Please verify your email.',
                                    token: token
                                });
                            } catch (emailError) {
                                return res.status(500).json({
                                    success: false,
                                    message: 'Server error during email sending'
                                });
                            }
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const {email, otp} = req.body;

        // find the user with matching email
        const sqlQuery = 'SELECT * FROM user WHERE email = ?';
        db.query(sqlQuery, [email], (err, results) => {
            if (err) {  
                return res.status(500).json({
                    success: false, 
                    message: 'Database error when finding user'
                });
            }
            
            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = results[0];

            console.log("User found otp:", user);
            // Update user status to verified

            // Compare OTP with strict equality
            if(user.verificationOTP !== otp) {
                console.log("OTP mismatch. Expected:", user.verificationOTP, "Received:", otp);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP'
                });
            }

            // Check if OTP is expired
            if(new Date() > new Date(user.verificationOTPExpiry)) {
                console.log("OTP expired. Expiry:", user.verificationOTPExpiry, "Current:", new Date());
                return res.status(400).json({
                    success: false,
                    message: 'Expired OTP'
                });
            }

            // update the user verification status
            const updateQuery = 'UPDATE user SET isEmailVerified = true, verificationOTP = NULL, verificationOTPExpiry = NULL WHERE userID = ?';
            db.query(updateQuery, [user.userID], (err, updateResults) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error when updating user'
                    });
                }

                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                try {
                    // Send welcome email after successful verification
                    sendAccountCreationEmail(email, user.username);
                } catch (emailError) {
                    console.error('Error sending welcome email:', emailError);
                    // Continue with the response even if email fails
                }
                
                // Generate JWT token
                const payload = {
                    userID: user.userID,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
                console.log("Token generated:", user.userID);

                return res.status(200).json({
                    success: true,
                    message: 'Email verified successfully',
                    token,
                    user: {
                        id: user.userID,
                        username: user.username,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                });
            });
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        }); 
    }
};

// resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const sqlQuery = 'SELECT * FROM user WHERE email = ?';
        db.query(sqlQuery, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error when finding user'
                });
            }
            
            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = results[0];

            // if email is already verified
            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified'
                });
            }

            // Generate new OTP
            const otp = generateOTP();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

            // Use a different variable name for the update query
            const updateQuery = 'UPDATE user SET verificationOTP = ?, verificationOTPExpiry = ? WHERE userId = ?';
            db.query(updateQuery, [otp, otpExpiry, user.id], async (err, updateResults) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error when updating OTP in'
                    });
                }
                
                try {
                    // Send email with the new OTP
                    await sendVerificationEmail(email, otp);
                    
                    return res.status(200).json({
                        success: true,
                        message: 'OTP resent successfully. Please check your email.'
                    });
                } catch (emailError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error sending verification email'
                    });
                }
            });
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while resending OTP'
        });
    }
};

const deleteUser= async (req, res) => {
    const { userId } = req.params;

  const query = "DELETE FROM user WHERE userID = ?";
  
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  });
}

const updateUser = async (req, res) => {
    
    try {
        console.log("Request params:", req.params);
        const { id } = req.params;  // Corrected parameter extraction
        console.log("Updating user with ID:", id);  

        const query = "UPDATE user SET username=?, email=?, role=? WHERE userID=?";
        const values = [req.body.username, req.body.email, req.body.role, id];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error updating user:", err);
                return res.status(500).json({ error: "Failed to update user" });
            }
            
            if (result.affectedRows === 0) {
                console.warn("User not found:", id);
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ message: "User updated successfully" });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

export { registerUser, loginUser, getAllUsers, createUser, deleteUser, updateUser, verifyEmail, resendOTP, getUserById };
