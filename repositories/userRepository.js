const pool = require("../config/db");

async function createUser(name, email, passwordHash, role = "User") {
    const query = `
        INSERT INTO Users
        (Name, Email, PasswordHash, Role)
        VALUES ($1, $2, $3, $4)
        RETURNING Id, Name, Email, Role, CreatedAt;
    `;

    const values = [name, email, passwordHash, role];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getUserByEmail(email) {
    const query = `
        SELECT Id, Name, Email, PasswordHash, Role, CreatedAt, UpdatedAt
        FROM Users
        WHERE Email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
}


async function getUserById(id) {
    const query = `
        SELECT Id, Name, Email, Role, CreatedAt, UpdatedAt
        FROM Users
        WHERE Id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById
};