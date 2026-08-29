const express = require("express");
const pool = require("../db");
const {
    isValidDateString
} = require("../validation/transactionValidation");

const router = express.Router();

router.get("/summary", async (req, res) => {
    try {
        const userId = req.user.userId;

        const { startDate, endDate } = req.query;

        if (startDate !== undefined && !isValidDateString(startDate)) {
            return res.status(400).json({
                error: "Start date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (endDate !== undefined && !isValidDateString(endDate)) {
            return res.status(400).json({
                error: "End date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (
            startDate !== undefined &&
            endDate !== undefined &&
            startDate > endDate
        ) {
            return res.status(400).json({
                error: "Start date cannot be after end date"
            });
        }

        const conditions = [
            "user_id = $1"
        ];

        const values = [
            userId
        ];

        if (startDate !== undefined) {
            values.push(startDate);

            conditions.push(
                `transaction_date >= $${values.length}`
            );
        }

        if (endDate !== undefined) {
            values.push(endDate);

            conditions.push(
                `transaction_date <= $${values.length}`
            );
        }

        const whereClause = conditions.join(" AND ");

        const result = await pool.query(
            `
            SELECT
                COALESCE(
                    SUM(amount) FILTER (WHERE type = 'income'),
                    0
                ) AS total_income,

                COALESCE(
                    SUM(amount) FILTER (WHERE type = 'expense'),
                    0
                ) AS total_expenses
            FROM transactions
            WHERE ${whereClause};
            `,
            values
        );

        const totalIncome = result.rows[0].total_income;
        const totalExpenses = result.rows[0].total_expenses;

        const balance =
            Number(totalIncome) - Number(totalExpenses);

        return res.json({
            totalIncome,
            totalExpenses,
            balance: balance.toFixed(2)
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch analytics summary"
        });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        if (startDate !== undefined && !isValidDateString(startDate)) {
            return res.status(400).json({
                error: "Start date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (endDate !== undefined && !isValidDateString(endDate)) {
            return res.status(400).json({
                error: "End date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (
            startDate !== undefined &&
            endDate !== undefined &&
            startDate > endDate
        ) {
            return res.status(400).json({
                error: "Start date cannot be after end date"
            });
        }

        const conditions = [
            "transactions.user_id = $1",
            "transactions.type = 'expense'"
        ];

        const values = [userId];

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

        const result = await pool.query(
            `
            SELECT
                COALESCE(categories.name, 'Uncategorized') AS category,
                SUM(transactions.amount) AS total
            FROM transactions
            LEFT JOIN categories
                ON transactions.category_id = categories.id
            WHERE ${whereClause}
            GROUP BY categories.id, categories.name
            ORDER BY total DESC;
            `,
            values
        );

        const grandTotal = result.rows.reduce(
            (sum, row) => sum + Number(row.total),
            0
        );

        const categories = result.rows.map((row) => {
            const total = Number(row.total);

            return {
                category: row.category,
                total: total.toFixed(2),
                percentage:
                    grandTotal === 0
                        ? 0
                        : Number(
                            ((total / grandTotal) * 100).toFixed(2)
                        )
            };
        });

        return res.json({
            totalExpenses: grandTotal.toFixed(2),
            categories
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch category analytics"
        });
    }
});

router.get("/trends", async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            startDate,
            endDate,
            groupBy = "month"
        } = req.query;

        if (!["day", "month", "year"].includes(groupBy)) {
            return res.status(400).json({
                error: "groupBy must be 'day', 'month', or 'year'"
            });
        }

        if (startDate !== undefined && !isValidDateString(startDate)) {
            return res.status(400).json({
                error: "Start date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (endDate !== undefined && !isValidDateString(endDate)) {
            return res.status(400).json({
                error: "End date must be a valid date in YYYY-MM-DD format"
            });
        }

        if (
            startDate !== undefined &&
            endDate !== undefined &&
            startDate > endDate
        ) {
            return res.status(400).json({
                error: "Start date cannot be after end date"
            });
        }

        const conditions = ["user_id = $1"];

        const values = [
            userId,
            groupBy
        ];

        if (startDate !== undefined) {
            values.push(startDate);
            conditions.push(
                `transaction_date >= $${values.length}`
            );
        }

        if (endDate !== undefined) {
            values.push(endDate);
            conditions.push(
                `transaction_date <= $${values.length}`
            );
        }

        const whereClause = conditions.join(" AND ");

        const result = await pool.query(
            `
            SELECT
                TO_CHAR(
                    DATE_TRUNC($2, transaction_date),
                    CASE
                        WHEN $2 = 'year' THEN 'YYYY'
                        WHEN $2 = 'month' THEN 'YYYY-MM'
                        ELSE 'YYYY-MM-DD'
                    END
                ) AS period,

                COALESCE(
                    SUM(amount) FILTER (WHERE type = 'income'),
                    0
                ) AS income,

                COALESCE(
                    SUM(amount) FILTER (WHERE type = 'expense'),
                    0
                ) AS expenses

            FROM transactions
            WHERE ${whereClause}

            GROUP BY DATE_TRUNC($2, transaction_date)
            ORDER BY DATE_TRUNC($2, transaction_date) ASC;
            `,
            values
        );

        const trends = result.rows.map((row) => ({
            period: row.period,
            income: row.income,
            expenses: row.expenses
        }));

        return res.json({
            groupBy,
            trends
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch analytics trends"
        });
    }
});



module.exports = router;