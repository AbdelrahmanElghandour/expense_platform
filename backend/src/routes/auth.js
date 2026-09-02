const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const {
    validateRegistration,
    validateLogin,
    normalizeRegistrationData,
    normalizeEmail
} = require("../validation/authValidation");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const validationError = validateRegistration(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const {
            name,
            email,
            password,
            currency
        } = normalizeRegistrationData(req.body);

        if (!name || !email || !password || !currency) {
            return res.status(400).json({
                error: "Name ,email, password, and currency are required"
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
            name,
            email,
            password_hash,
            default_currency
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, default_currency, created_at;
        `,
            [name, email, passwordHash, currency]
        );

        res.status(201).json({
            message: "Account created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        return res.status(500).json({
            error: "Registration failed"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        // Validate the incoming login data
        const validationError = validateLogin(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        // Normalize email so login is case-insensitive
        const email = normalizeEmail(req.body.email);
        const password = req.body.password;

        // Find the user
        const result = await pool.query(
            `
            SELECT id, email, password_hash, default_currency
            FROM users
            WHERE email = $1;
            `,
            [email]
        );

        // Don't reveal whether the email exists
        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare submitted password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.json({
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

        return res.status(500).json({
            error: "Login failed"
        });
    }
});

module.exports = router;