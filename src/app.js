import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import passport from "passport";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import { setupPassport } from "./config/passport.js";
import routes from './routes/index.js';

dotenv.config();

const app = express();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Passport
setupPassport(passport);
app.use(passport.initialize());

// Healthcheck BEFORE mounting complex routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Versioned API
app.use("/api", routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "Server Error",
  });
});

export default app;