const spicedPg = require("spiced-pg");
const { hash, genSalt, compare } = require("bcryptjs");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secret.json");
const DATABASE_NAME = "spiced-petition";
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

async function hashPassword(password) {
    const salt = await genSalt();
    return hash(password, salt);
}

function getSigners() {
    return db
        .query(
            `SELECT first_name, last_name, age, city, website 
            FROM users 
            INNER JOIN signatures ON users.id = signatures.user_id
            INNER JOIN user_profiles ON users.id = user_profiles.user_id`
        )
        .then((result) => result.rows);
}

function getUserById(user_id) {
    return db
        .query(
            `
    SELECT first_name, last_name, email, age, city, website, signature
    FROM users
    FULL JOIN signatures ON users.id = signatures.user_id
    FULL JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE users.id = $1
    `,
            [user_id]
        )
        .then((result) => result.rows[0]);
}

async function getCurrentUserProfile(user_id) {
    const result = await db.query(
        `
    SELECT * FROM user_profiles WHERE user_id = $1
    `,
        [user_id]
    );
    return result.rows[0];
}

async function getSignature(user_id) {
    const result = await db.query(
        `SELECT * FROM signatures WHERE user_id = $1`,
        [user_id]
    );
    return result.rows[0];
}

// SIGN PETITION
function signUp({ signature }, { user_id }) {
    return db
        .query(
            `
    INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2)
    RETURNING *
    `,
            [signature, user_id]
        )
        .then((result) => result.rows[0]);
}

// DELETE SIGNATURE
function deleteSignature(user_id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [user_id]);
}

// DELETE USER
async function deleteUser(id) {
    return db.query(`DELETE FROM users WHERE id = $1`, [id]);
}
// DELETE PROFILE
async function deleteProfile(user_id) {
    return db.query(`DELETE FROM user_profiles WHERE user_id = $1`, [user_id]);
}

// CREATE USER
async function createUser({ first_name, last_name, email, password }) {
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
        `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [first_name, last_name, email, hashedPassword]
    );
    return result.rows[0];
}

// ADDITIONAL INFORMATIONS

async function createProfile({ age, city, website }, user_id) {
    const result = await db.query(
        `
    INSERT INTO user_profiles (age, city, website, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [age || null, city, website, user_id]
    );
    return result.rows[0];
}

// EDIT USER

async function editUser({ first_name, last_name, email, user_id }) {
    const result = await db.query(
        `UPDATE users
    SET first_name = $1, last_name = $2, email = $3
    WHERE users.id = $4
    `,
        [first_name, last_name, email, user_id]
    );
    return result.rows[0];
}

async function editProfile({ age, city, website, user_id }) {
    const result = await db.query(
        ` INSERT INTO
    user_profiles (age, city, website, user_id )
    VALUES($1, $2,$3,$4)
    ON CONFLICT (user_id)
    DO UPDATE SET 
    age = $1, city = $2, website = $3`,
        [age, city, website, user_id]
    );
    return result.rows[0];
}

// EDIT PASSWORD
async function editPassword(password, id) {
    console.log("Password id", password, id);
    const hashedPassword = await hashPassword(password);
    console.log("hashedPassword");
    const result = await db.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE users.id = $2
        `,
        [hashedPassword, id]
    );
    return result.rows[0];
}

// GET USER BY EMAIL

async function getUserByEmail(email) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
        email,
    ]);
    return result.rows[0];
}

// LOGIN

async function login({ email, password }) {
    const foundUser = await getUserByEmail(email);
    // console.log("user", foundUser);
    if (!foundUser) {
        return null;
    }
    const match = await compare(password, foundUser.password_hash);
    // console.log("match", match);
    if (!match) {
        return null;
    }
    return foundUser;
}

// FIND SIGNER WITH SAME CITY

async function findCities(city) {
    return db
        .query(
            `
            SELECT first_name, last_name, age, city, website 
            FROM users 
            INNER JOIN signatures ON users.id = signatures.user_id
            INNER JOIN user_profiles ON users.id = user_profiles.user_id
            WHERE LOWER(city) = LOWER($1)
            `,
            [city]
        )
        .then((result) => result.rows);
}

//
module.exports = {
    getSigners,
    getSignature,
    getUserById,
    getCurrentUserProfile,
    signUp,
    createUser,
    login,
    createProfile,
    findCities,
    editUser,
    editProfile,
    deleteSignature,
    deleteUser,
    deleteProfile,
    editPassword,
};
