const pool = require("../src/db");

beforeAll(async () => {
    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS name TEXT;
    `);
});

afterAll(async () => {
    await pool.end();
});