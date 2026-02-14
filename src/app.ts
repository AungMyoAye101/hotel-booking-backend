import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { limiter } from "./utils/limiter";
import { errorHandler } from "./middleware/errorHandler.middleware";
import adminRouter from "./routes/admin.auth.route";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import hotelRouter from "./routes/hotel.route";
import roomRouter from "./routes/room.route";
import reviewRouter from "./routes/review.route";
import bookingRouter from "./routes/booking.route";
import imageRouter from "./routes/image.route";
import paymentRouter from "./routes/payment.route";
import receiptRouter from "./routes/receipt.route";
import analyticRouter from "./routes/analytic.route";
import cleanupRouter from "./routes/cleanup.route";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { customLogger } from "./middleware/customLogger";

dotenv.config();

const app: express.Express = express();

const allow_origin = process.env.ORIGIN_URL as string;
const allowedOrigins = [
    allow_origin,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://booking-dashboard-one.vercel.app",
    "https://booking-seven-delta.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow server-to-server or tools like Postman
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
//Middleware for route handler


app.use(limiter);

// Custom logger that logs to both console and file
app.use(customLogger);

//roures
app.use("/api/v1/analytic", isAuthenticated, analyticRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", isAuthenticated, userRouter);
app.use("/api/v1/hotel", hotelRouter);
app.use("/api/v1/image", isAuthenticated, imageRouter);
app.use("/api/v1/review", isAuthenticated, reviewRouter);
app.use("/api/v1/booking", isAuthenticated, bookingRouter);
app.use("/api/v1/payment", isAuthenticated, paymentRouter);
app.use("/api/v1/receipt", isAuthenticated, receiptRouter);
app.use("/api/v1/room", roomRouter);
app.use('/api/v1/auto', cleanupRouter)

//error handler middleware.
app.use(errorHandler);


export default app;
