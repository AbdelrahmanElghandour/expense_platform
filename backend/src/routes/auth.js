const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");

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

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const result = await pool.query(
            `
            SELECT id, email, password_hash, default_currency
            FROM users
            WHERE email = $1;
            `,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id // The information we are putting inside the token.
            },
            process.env.JWT_SECRET, // The secret used to sign it
            {
                expiresIn: "1h" // the token expires after 1 hour
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                default_currency: user.default_currency
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Login failed"
        });
    }
});

module.exports = router;