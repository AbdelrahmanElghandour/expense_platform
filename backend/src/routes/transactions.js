const express = require("express");
const pool = require("../db");

const {
    validateCreateTransaction,
    normalizeTransactionData,
    validatePatchTransaction
} = require("../validation/transactionValidation");


const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                transactions.id,
                transactions.type,
                transactions.amount,
                categories.name AS category,
                transactions.payment_method,
                transactions.notes,
                transactions.transaction_date
            FROM transactions
            LEFT JOIN categories
                ON transactions.category_id = categories.id
            WHERE transactions.user_id = $1
            ORDER BY transactions.transaction_date DESC;
            `,
            [req.user.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve transaction"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const validationError = validateCreateTransaction(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const {
            type,
            amount,
            category,
            payment_method,
            notes,
            transactionDate
        } = normalizeTransactionData(req.body);
        
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
            INSERT INTO transactions (
                user_id,
                type,
                category_id,
                amount,
                payment_method,
                notes,
                transaction_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `,
            [
                req.user.userId,
                type,
                categoryId,
                amount,
                payment_method,
                notes,
                transactionDate
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create transaction"
        });
    }
});

router.patch("/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.userId;

        const validationError = validatePatchTransaction(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const {
            type,
            amount,
            category,
            paymentMethod,
            notes,
            transactionDate
        } = normalizeTransactionData(req.body);

        const transactionResult = await pool.query(
            `
            SELECT id
            FROM transactions
            WHERE id = $1
              AND user_id = $2;
            `,
            [transactionId, userId]
        );

        if (transactionResult.rows.length === 0) {
            return res.status(404).json({
                error: "Transaction not found"
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

        if (type !== undefined) {
            updates.push(`type = $${index++}`);
            values.push(type);
        }

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

        if (transactionDate !== undefined) {
            updates.push(`transaction_date = $${index++}`);
            values.push(transactionDate);
        }

        updates.push("updated_at = CURRENT_TIMESTAMP");

        values.push(transactionId);
        values.push(userId);

        const result = await pool.query(
            `
            UPDATE transactions
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
            error: "Failed to update transaction"
        });
    }
});

router.delete("/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            DELETE FROM transactions
            WHERE id = $1
              AND user_id = $2
            RETURNING *;
            `,
            [transactionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully",
            transaction : result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete transaction"
        });
    }
}); 

module.exports = router; // make the router avaialble to server.js
