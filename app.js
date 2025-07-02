import express from 'express';
import dotenv from "dotenv";
import { connectDb } from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";
import { errorMiddleware } from './middleware/error.js';



dotenv.config({
    path: "./config/.env",
})



const app = express();
const PORT = process.env.PORT;
const uri = process.env.MONGO_URI;
const FURL = process.env.FRONTEND_URL;
const adminSecretKey = process.env.ADMIN_SECRET_KEY;


// database
connectDb(uri);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});





// middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));




app.use(cors({
    origin: FURL,
    methods: ["POST, GET, PUT, DELETE"],
    credentials: true,
}))


// Test Route
app.get("/", (req, res) => {
    res.json({ success: true, message: "API is working!" });
});


// routes
import userRoutes from './routes/User.js';
import adminRoutes from './routes/Admin.js';
import blogRoutes from './routes/BlogRoute.js';


// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use('/api/v1/blog', blogRoutes);






// errormiddleware
app.use(errorMiddleware)

// Error Handling Middleware (Fix `[object Object]` issue)
app.use((err, req, res, next) => {
    console.error("Middleware Error:", JSON.stringify(err, null, 2)); // Ensure proper logging

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});


// const server = app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Promise Rejection: ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");

    server.close(() => {
        process.exit(1);
    });
});


export default app;