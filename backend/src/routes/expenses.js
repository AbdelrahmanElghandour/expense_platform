const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `
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
            WHERE expenses.user_id = $1;
            `,
            [req.user.userId]
        );

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
            category,
            paymentMethod,
            notes,
            expenseDate
        } = req.body;

        const categoryResult = await pool.query(
            `
            SELECT id
            FROM categories
            WHERE user_id = $1
              AND LOWER(name) = LOWER($2);
            `,
            [req.user.userId, category]
        );

        let categoryId;

        if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].id;
        } else {
            const newCategory = await pool.query(
                `
                INSERT INTO categories (user_id, name)
                VALUES ($1, $2)
                RETURNING id;
                `,
                [req.user.userId, category]
            );

            categoryId = newCategory.rows[0].id;
        }

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
            [
                req.user.userId,
                categoryId,
                amount,
                paymentMethod,
                notes,
                expenseDate
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create expense"
        });
    }
});

router.patch("/:expenseId", async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { category } = req.body;
        const userId = req.user.userId;

        // Make sure the expense belongs to the logged-in user
        const expenseResult = await pool.query(
            `
            SELECT id
            FROM expenses
            WHERE id = $1
              AND user_id = $2;
            `,
            [expenseId, userId]
        );

        if (expenseResult.rows.length === 0) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        // Remove the category
        if (category === null) {
            const result = await pool.query(
                `
                UPDATE expenses
                SET category_id = NULL
                WHERE id = $1
                  AND user_id = $2
                RETURNING *;
                `,
                [expenseId, userId]
            );

            return res.json(result.rows[0]);
        }

        // Find the user's category, ignoring capitalization
        const categoryResult = await pool.query(
            `
            SELECT id
            FROM categories
            WHERE user_id = $1
              AND LOWER(name) = LOWER($2);
            `,
            [userId, category]
        );

        let categoryId;

        if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].id;
        } else {
            // Create the category if it doesn't exist
            const newCategory = await pool.query(
                `
                INSERT INTO categories (user_id, name)
                VALUES ($1, $2)
                RETURNING id;
                `,
                [userId, category]
            );

            categoryId = newCategory.rows[0].id;
        }

        // Update only this expense
        const result = await pool.query(
            `
            UPDATE expenses
            SET category_id = $1
            WHERE id = $2
              AND user_id = $3
            RETURNING *;
            `,
            [categoryId, expenseId, userId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update expense"
        });
    }
});


router.delete("/:expenseId", async (req, res) => {
    try {
        const { expenseId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
              AND user_id = $2
            RETURNING *;
            `,
            [expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        res.json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete expense"
        });
    }
}); 

module.exports = router; // make the router avaialble to server.js
