import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongo from "./config/mongoDb.js";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();
connectToMongo();

const app = express();

// Middleware - Ensure session is added before routes
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-default-secret", // Fallback secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, // Prevent client-side access to cookies
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // For cross-origin requests
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  console.log("Server is closing due to uncaughtException");
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Routes
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import comicRouter from "./routes/comicRouter.js";

app.use("/api/v1", userRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", comicRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 5001;

// Start the server and capture the server instance
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (err) => {
  console.log("Server is closing due to unhandledRejection");
  console.log(`Error: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});
