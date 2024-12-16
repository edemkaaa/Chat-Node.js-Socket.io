// models/User.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'edem',
    host: 'localhost',
    database: 'edem',
    password: 'edem',
    port: 5432,
});

const createUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `;
    await pool.query(query);
};

const registerUser = async (username, password) => {
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    const values = [username, password];
    const res = await pool.query(query, values);
    return res.rows[0];
};

const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const res = await pool.query(query, values);
    return res.rows[0];
};

module.exports = { createUserTable, registerUser, findUserByUsername };