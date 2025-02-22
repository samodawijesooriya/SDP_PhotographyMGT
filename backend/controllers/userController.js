import db from '../config/db.js'; // Adjust the path as necessary
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import UserModel from '../models/userModel.js';

// create a tokem
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'randomstring', { expiresIn: '1h' });
};

// register user
const registerUser = async (req, res) => {
    const { username, email, password, mobile } = req.body;
    const role = req.body.role || 'customer';

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

            // // validate the mobile number
            // if (!validator.isMobilePhone(mobile, 'en-IN')) {
            //     return res.json({ success: false, message: "Invalid mobile number" });
            // }

            // cannot decrypt the password (ERROR: data and hash arguments required)
            // Encrypt the password
            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(password, salt);

            // Generate new user ID
            const sqlId = 'SELECT COALESCE(MAX(userID), 0) AS maxId FROM user';
            db.query(sqlId, (err, result) => {
                if (err) {
                    return res.json({ success: false, message: "An error occurred while generating a new ID" });
                }
                const newId = result[0].maxId + 1;
                
                // Insert new user
                const sqlInsert = 'INSERT INTO user (userID, username, email, password, role, mobile) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(sqlInsert, [newId, username, email, password, role, mobile], (err, user) => {
                    if (err) {
                        return res.json({ success: false, message: "An error occurred while creating the user" });
                    }

                    // Create a token
                    const token = createToken(newId);
                    res.json({ success: true, token: token });
                });
            });
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "An error occurred" });
    }
};

// login user
const loginUser =async (req, res) => {
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
        const sqlFind = 'SELECT * FROM user WHERE username = ?';
        db.query(sqlFind, [username], async (err, results) => {
            if (err) {
                console.log(err);
                return res.json({ 
                    success: false, 
                    message: "An error occurred while logging in" 
                });
            }

            // Check if user exists
            if (results.length === 0) {
                return res.json({ 
                    success: false, 
                    message: "No username or password" 
                });
            }

            const user = results[0];

            // Compare passwords
            // const match = await bcrypt.compare(password, user.password);
            const match = password === user.password;
            console.log("Provided Password:", password);
            console.log("Stored Password Hash:", user.password);
            console.log("Password Match:", match);
            if (!match) {
                return res.json({ 
                    success: false, 
                    message: "Invalid username or password" 
                });
            }

            // Create token
            const token = createToken(user.userID);

            // Send successful response
            res.json({
                success: true,
                token: token,
                user: {
                    userID: user.userID,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.log(error);
        res.json({ 
            success: false, 
            message: "An error occurred during login" 
        });
    }
}

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

// function to create a new user
const createUser = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    // Create a User
    const user = new UserModel({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        mobile: req.body.mobile
    });

    // Save User in the database
    UserModel.createUser(user, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        } else {
            res.send(data);
        }
    });
};

export { registerUser, loginUser, getAllUsers, createUser };
