const express = require("express");
const expenseRouter = require("./src/routes/expenses"); 

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Express Platform!");
});

app.use("/expenses", expenseRouter); // whenever a request starts with /expenses, send it to expenseRouter

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});