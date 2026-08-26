const express = require("express");


const transactionRouter = require("./src/routes/transactions");

const authRouter = require("./src/routes/auth"); 

const authenticateToken = require("./src/middleware/auth");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Express Platform!");
});

app.use("/transactions", authenticateToken, transactionRouter);

app.use("/auth", authRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});