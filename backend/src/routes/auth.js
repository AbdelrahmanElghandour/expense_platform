const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {
            email,
            password,
            currency
        } = req.body;

        if (!email || !password || !currency) {
            return res.status(400).json({
                error: "Email, password, and currency are required"
            });
            // returns sends the response & stops the route from continuing
        }
        const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        // bcrypt deliberatly makes hasing computationally expensive so that attackers cannot try huge number
        // of passwords efficiently
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
        `
        INSERT INTO users (
            email,
            password_hash,
            default_currency
        )
        VALUES ($1, $2, $3)
        RETURNING id, email, default_currency, created_at;
        `,
        [email, passwordHash, currency]
    );

        res.status(201).json({
            message: "Account created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Registration failed"
        });
    }
});

module.exports = router;