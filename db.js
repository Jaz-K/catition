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
            `SELECT users.first_name, users.last_name FROM users INNER JOIN signatures ON users.id = signatures.user_id`
        )
        .then((result) => result.rows);
}
/* function getSigners() {
    return db.query(`SELECT * FROM users`).then((result) => result.rows);
} */

function getSigner(user_id) {
    return db
        .query(`SELECT * FROM signatures WHERE user_id = $1`, [user_id])
        .then((result) => result.rows[0]);
}
// sign up

function signUp({ signature }, { user_id }) {
    return db
        .query(
            `
    INSERT INTO signatures (signature, user_id)
    VALUES ($1,$2)
    RETURNING *
    `,
            [signature, user_id]
        )
        .then((result) => result.rows[0]);
}
/* function signUp({ first_name, last_name, signature }) {
    return db
        .query(
            `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0]);
} */

// createUser
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

// get additional informations

async function createProfile({ age, city, website }, user_id) {
    const result = await db.query(
        `
    INSERT INTO user_profiles (age, city, website, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [age, city, website, user_id]
    );
    return result.rows[0];
}
//getUserByEmail

async function getUserByEmail(email) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
        email,
    ]);
    return result.rows[0];
}

// login

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

/* async function userCount() {
    const result = await db.query(`SELECT COUNT(id) FROM signatures`);
    return result.rows;
} */

// edit profile

// delete Signer or complete profile

//
module.exports = {
    getSigners,
    getSigner,
    signUp,
    createUser,
    login,
    createProfile,
    // userCount,
};
