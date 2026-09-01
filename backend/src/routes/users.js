const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/me", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                default_currency,
                created_at
            FROM users
            WHERE id = $1;
            `,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch user"
        });
    }
});

module.exports = router;