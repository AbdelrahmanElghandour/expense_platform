const pool = require("../db");

async function resolveCategoryId(userId, category, database = pool) {
    if (category === null || category === undefined) {
        return null;
    }

    const categoryResult = await database.query(
        `
        SELECT id
        FROM categories
        WHERE user_id = $1
          AND LOWER(name) = LOWER($2);
        `,
        [userId, category]
    );

    if (categoryResult.rows.length > 0) {
        return categoryResult.rows[0].id;
    }

    const newCategory = await database.query(
        `
        INSERT INTO categories (user_id, name)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING id;
        `,
        [userId, category]
    );

    if (newCategory.rows.length > 0) {
        return newCategory.rows[0].id;
    }

    // Another request may have created the category
    // after our initial SELECT but before our INSERT.
    const existingCategory = await database.query(
        `
        SELECT id
        FROM categories
        WHERE user_id = $1
          AND LOWER(name) = LOWER($2);
        `,
        [userId, category]
    );

    if (existingCategory.rows.length === 0) {
        throw new Error("Failed to resolve category");
    }

    return existingCategory.rows[0].id;
}

module.exports = {
    resolveCategoryId
};