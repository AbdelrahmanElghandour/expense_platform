const express = require("express");
const pool = require("../db");

const {
    validateCreateTransaction,
    normalizeTransactionData,
    validatePatchTransaction,
    validateTransactionId,
    validateTransactionFilters
} = require("../validation/transactionValidation");
const { resolveCategoryId } =
    require("../services/categoryService");


const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const filterError = validateTransactionFilters(req.query);

        if (filterError) {
            return res.status(400).json({
                error: filterError
            });
        }

        const rawPage = req.query.page;
        const rawLimit = req.query.limit;

        const page = rawPage === undefined ? 1 : Number(rawPage);
        const limit = rawLimit === undefined ? 20 : Number(rawLimit);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                error: "Page must be a positive integer"
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: "Limit must be an integer between 1 and 100"
            });
        }

        const {
            type,
            category,
            startDate,
            endDate
        } = req.query;

        const conditions = [
            "transactions.user_id = $1"
        ];

        const values = [
            req.user.userId
        ];

        if (type !== undefined) {
            values.push(type);

            conditions.push(
                `transactions.type = $${values.length}`
            );
        }

        if (category !== undefined) {
            values.push(category);

            conditions.push(
                `LOWER(categories.name) = LOWER($${values.length})`
            );
        }

        if (startDate !== undefined) {
            values.push(startDate);

            conditions.push(
                `transactions.transaction_date >= $${values.length}`
            );
        }

        if (endDate !== undefined) {
            values.push(endDate);

            conditions.push(
                `transactions.transaction_date <= $${values.length}`
            );
        }

        const whereClause = conditions.join(" AND ");

        const countResult = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM transactions
            LEFT JOIN categories
                ON transactions.category_id = categories.id
            WHERE ${whereClause};
            `,
            values
        );

        const totalTransactions = Number(countResult.rows[0].total);
        const totalPages = Math.ceil(totalTransactions / limit);

        const offset = (page - 1) * limit;

        const queryValues = [...values];

        queryValues.push(limit);
        const limitIndex = queryValues.length;

        queryValues.push(offset);
        const offsetIndex = queryValues.length;

        const result = await pool.query(
            `
            SELECT
                transactions.id,
                transactions.type,
                transactions.amount,
                categories.name AS category,
                transactions.payment_method,
                transactions.notes,
                TO_CHAR(transactions.transaction_date, 'YYYY-MM-DD') AS transaction_date
            FROM transactions
            LEFT JOIN categories
                ON transactions.category_id = categories.id
            WHERE ${whereClause}
            ORDER BY transactions.transaction_date DESC
            LIMIT $${limitIndex}
            OFFSET $${offsetIndex};
            `,
            queryValues
        );

        return res.json({
            page,
            limit,
            totalTransactions,
            totalPages,
            transactions: result.rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to retrieve transactions"
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

        const categoryId = await resolveCategoryId(
            req.user.userId,
            category
        );

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

        const transactionIdError = validateTransactionId(transactionId);

        if (transactionIdError) {
            return res.status(400).json({
                error: transactionIdError
            });
        }
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
            payment_method,
            notes,
            transactionDate
        } = normalizeTransactionData(req.body);

        // Make sure the transaction belongs to the logged-in user
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

        // Only resolve category if the client actually provided it
        let categoryId;

        if (category !== undefined) {
            categoryId = await resolveCategoryId(
                userId,
                category
            );
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

        if (payment_method !== undefined) {
            updates.push(`payment_method = $${index++}`);
            values.push(payment_method);
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

        return res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to update transaction"
        });
    }
});

router.delete("/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.userId;

        const transactionIdError = validateTransactionId(transactionId);

        if (transactionIdError) {
            return res.status(400).json({
                error: transactionIdError
            });
        }

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

        return res.json({
            message: "Transaction deleted successfully",
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to delete transaction"
        });
    }
});

module.exports = router; // make the router avaialble to server.js
