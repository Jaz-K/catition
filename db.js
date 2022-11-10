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
    return db.query(`SELECT * FROM signatures`).then((result) => result.rows);
}

function getSigner(id) {
    return db
        .query(`SELECT * FROM signatures WHERE id = $1`, [id])
        .then((result) => result.rows[0]);
}
// sign up

function signUp({ first_name, last_name, signature }) {
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
}

// login

/* async function login({ email, password }) {
    const foundUser = users.find((user) => user.email === email);
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
//getUserByEmail

// edit profile

// delete Signer or complete profile

//
module.exports = {
    getSigners,
    getSigner,
    signUp,
    createUser,
    // login,
};
