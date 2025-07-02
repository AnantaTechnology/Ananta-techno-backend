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
// export 
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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



export { app, PORT, adminSecretKey };