const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

const {
    validatePassword
} = require("../validation/authValidation");

const router = express.Router();

const {
    validateProfileUpdate,
    normalizeProfileUpdate
} = require("../validation/uservalidation");

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


router.patch("/me", async (req, res) => {
    try {
        const validationError =
            validateProfileUpdate(req.body);

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const {
            name,
            currency
        } = normalizeProfileUpdate(req.body);

        const result = await pool.query(
            `
            UPDATE users
            SET
                name = COALESCE($1, name),
                default_currency = COALESCE($2, default_currency)
            WHERE id = $3
            RETURNING
                id,
                name,
                email,
                default_currency,
                created_at;
            `,
            [
                name ?? null,
                currency ?? null,
                req.user.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to update profile"
        });
    }
});

router.patch("/me/password", async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        // Validate current password presence/type
        if (
            typeof currentPassword !== "string" ||
            currentPassword.length === 0
        ) {
            return res.status(400).json({
                error: "Current password is required"
            });
        }

        // Apply our normal password rules to the new password
        const passwordError = validatePassword(newPassword);

        if (passwordError) {
            return res.status(400).json({
                error: passwordError
            });
        }

        // Get the authenticated user's current password hash
        const result = await pool.query(
            `
            SELECT password_hash
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

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            result.rows[0].password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Current password is incorrect"
            });
        }

        const newPasswordHash = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2;
            `,
            [
                newPasswordHash,
                req.user.userId
            ]
        );

        return res.json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to change password"
        });
    }
});

router.delete("/me", async (req, res) => {
    try {
        const { password } = req.body;

        if (
            typeof password !== "string" ||
            password.length === 0
        ) {
            return res.status(400).json({
                error: "Password is required"
            });
        }

        // Get the authenticated user's password hash
        const result = await pool.query(
            `
            SELECT password_hash
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

        // Verify their password before allowing deletion
        const passwordMatches = await bcrypt.compare(
            password,
            result.rows[0].password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Incorrect password"
            });
        }

        await pool.query(
            `
            DELETE FROM users
            WHERE id = $1;
            `,
            [req.user.userId]
        );

        return res.json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to delete account"
        });
    }
});

module.exports = router;