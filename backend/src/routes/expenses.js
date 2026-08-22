const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                expenses.id,
                expenses.amount,
                categories.name AS category,
                expenses.payment_method,
                expenses.notes,
                expenses.expense_date
            FROM expenses
            JOIN categories
                ON expenses.category_id = categories.id
            WHERE expenses.user_id = 1;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve expenses"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            amount,
            categoryId,
            paymentMethod,
            notes,
            expenseDate
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO expenses (
                user_id,
                category_id,
                amount,
                payment_method,
                notes,
                expense_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [1, categoryId, amount, paymentMethod, notes, expenseDate]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create expense"
        });
    }
});

module.exports = router; // make the router avaialble to server.js