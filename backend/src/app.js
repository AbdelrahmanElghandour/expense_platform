require("./config/env");

const express = require("express");
const helmet = require("helmet");
const analyticsRouter = require("./routes/analytics");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRouter = require("./routes/auth");
const transactionRouter = require("./routes/transactions");
const authenticateToken = require("./middleware/auth");
const { notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({
    limit: "100kb"
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later."
    }
});

// if (process.env.NODE_ENV !== "test") {
//     app.use("/auth", authLimiter);
// }

app.use("/auth", authRouter);

app.use("/transactions", authenticateToken, transactionRouter);

app.use(
    "/analytics",
    authenticateToken,
    analyticsRouter
);

app.use(notFoundHandler);

module.exports = app;