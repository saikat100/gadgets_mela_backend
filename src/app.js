import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // your updated DB function
import routes from "./routes/index.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import passport from "passport";
import { setupPassport } from "./config/passport.js";

dotenv.config();

const app = express();

// Connect to local MongoDB
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
    max: 1000, // Increased for development
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Passport
setupPassport(passport);
app.use(passport.initialize());

// Healthcheck
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Error handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

export default app;
