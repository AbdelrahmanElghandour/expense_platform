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
        const userId = req.user.userId;

        const {
            amount,
            category,
            paymentMethod,
            notes,
            expenseDate
        } = req.body;

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

        let categoryId;

        if (category === null) {
            categoryId = null;

        } else if (category !== undefined) {
            const categoryResult = await pool.query(
                `
                SELECT id
                FROM categories
                WHERE user_id = $1
                  AND LOWER(name) = LOWER($2);
                `,
                [userId, category]
            );

            if (categoryResult.rows.length > 0) {
                categoryId = categoryResult.rows[0].id;
            } else {
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
        }

        const updates = [];
        const values = [];

        let index = 1;

        if (amount !== undefined) {
            updates.push(`amount = $${index++}`);
            values.push(amount);
        }

        if (category !== undefined) {
            updates.push(`category_id = $${index++}`);
            values.push(categoryId);
        }

        if (paymentMethod !== undefined) {
            updates.push(`payment_method = $${index++}`);
            values.push(paymentMethod);
        }

        if (notes !== undefined) {
            updates.push(`notes = $${index++}`);
            values.push(notes);
        }

        if (expenseDate !== undefined) {
            updates.push(`expense_date = $${index++}`);
            values.push(expenseDate);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided to update"
            });
        }

        updates.push("updated_at = CURRENT_TIMESTAMP");

        values.push(expenseId);
        values.push(userId);

        const result = await pool.query(
            `
            UPDATE expenses
            SET ${updates.join(", ")}
            WHERE id = $${index}
              AND user_id = $${index + 1}
            RETURNING *;
            `,
            values
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
