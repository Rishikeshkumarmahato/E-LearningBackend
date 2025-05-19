// import express from 'express';
// import cors from 'cors'
// import bodyParser from 'body-parser';
// import dotenv from 'dotenv';
// import dbConnection from './config/db.js';
// import StudentModel from './models/student.schema.js';

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.urlencoded({extended:true}));
// app.use(cors());

// // Initialize database connection
// const initializeDB = async () => {
//     try {
//         if (!process.env.MONGODB_URI) {
//             throw new Error('MONGODB_URI is not defined in environment variables');
//         }
//         await dbConnection();
//         console.log('Database initialized successfully');
//     } catch (error) {
//         console.error('Failed to initialize database:', error);
//         process.exit(1);
//     }
// };

// // Start the server and connect to database
// const PORT = process.env.PORT || 5000;
// initializeDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });
// });

// app.get('/register',(req,res)=>{
//     res.send('Hello World');
// });
// app.post('/register', async (req,res) => {
//     try {
//         const {username, email, phone, password} = req.body;
        
//         // Check if email exists
//         const emailExists = await StudentModel.findOne({email: email});
//         if(emailExists) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email already exists"
//             });
//         }

//         // Check if phone exists
//         const phoneExists = await StudentModel.findOne({phone: phone});
//         if(phoneExists) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Phone number already exists"
//             });
//         }

//         // Create new student
//         const newStudent = new StudentModel({
//             username,
//             email,
//             phone,
//             password
//         });

//         await newStudent.save();

//         // Return success without sensitive data
//         const userData = {
//             username: newStudent.username,
//             email: newStudent.email,
//             phone: newStudent.phone
//         };

//         res.status(200).json({
//             success: true,
//             message: "User registered successfully",
//             user: userData
//         });
//     } catch (error) {
//         console.error("Registration error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// });
// app.post('/login',(req,res)=>{
//     const {email,password}=req.body;
//     StudentModel.findOne({email:email}).then((userExist)=>{
//         if(!userExist){
//             return res.status(400).json({
//                 success: false,
//                 message: "Student not found"
//             });
//         }
//         if(userExist.password!==password){
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid credentials"
//             });
//         }
        
//         // Create a safe user object without sensitive data
//         const userData = {
//             username: userExist.username,
//             email: userExist.email,
//             phone: userExist.phone
//         };

//         res.status(200).json({
//             success: true,
//             message: "User logged in successfully",
//             user: userData
//         });
        
//     }).catch((err)=>{
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     })
// })

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import dbConnection from './config/db.js';
import StudentModel from './models/student.schema.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Initialize MongoDB connection
const initializeDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await dbConnection();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        process.exit(1);
    }
};

// Routes

// Basic test route
app.get('/register', (req, res) => {
    res.send('Hello World');
});

// Register route
app.post('/register', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if (!username || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const emailExists = await StudentModel.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const phoneExists = await StudentModel.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new StudentModel({
            username,
            email,
            phone,
            password: hashedPassword
        });

        await newStudent.save();

        const userData = {
            username: newStudent.username,
            email: newStudent.email,
            phone: newStudent.phone
        };

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: userData
        });

    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExist = await StudentModel.findOne({ email });
        if (!userExist) {
            return res.status(400).json({
                success: false,
                message: "Student not found"
            });
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const userData = {
            username: userExist.username,
            email: userExist.email,
            phone: userExist.phone
        };

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: userData
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Start the server after DB connection
const PORT = process.env.PORT || 5000;
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});



