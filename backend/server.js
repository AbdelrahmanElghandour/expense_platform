require("./src/config/env");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const transactionRouter = require("./src/routes/transactions");
const authRouter = require("./src/routes/auth"); 
const authenticateToken = require("./src/middleware/auth");
const app = express();

const {
    notFoundHandler,
    errorHandler
} = require("./src/middleware/errorHandler");

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later."
    }
});


app.get("/", (req, res) => {
    res.send("Hello from Express Platform!");
});

app.use("/transactions", authenticateToken, transactionRouter);

app.use("/auth",authLimiter, authRouter);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
