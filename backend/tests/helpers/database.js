const pool = require("../../src/db");

async function resetDatabase() {
    await pool.query(`
        TRUNCATE TABLE users
        RESTART IDENTITY
        CASCADE;
    `);
}

module.exports = {
    resetDatabase
};