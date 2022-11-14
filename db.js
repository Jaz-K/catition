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
/* function getSigners() {
    return db.query(`SELECT * FROM users`).then((result) => result.rows);
} */

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
    VALUES ($1,$2)
    RETURNING *
    `,
            [signature, user_id]
        )
        .then((result) => result.rows[0]);
}

// DELETE SIGNATURE
function deleteSignature(id) {
    return db.query(`DELETE FROM signatures WHERE id = $1`, [id]);
}

// DELETE USER

/* async function deleteUser(user_id) {
    return db
        .query
        /*         `DELETE FROM
users
user_profiles
signatures
WHERE
users.id = user_id AND
user_profiles 
` */

/* `DELETE FROM users WHERE id = $1`, [user_id],
        `DELETE FROM signatures WHERE id = $1`, [user_id],
        `DELETE FROM user_profiles WHERE id = $1`, [user_id]; */
/*     `JOIN signatures ON users.id = signatures.user_id
    JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE user.id = $1
    `,
        [user_id]
        ();
} */

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
        [+age, city, website, user_id]
    );
    return result.rows[0];
}

// EDIT USER

async function editUser(
    { first_name, last_name, email, password },
    { user_id }
) {
    const result = await db.query(
        `UPDATE users
    SET first_name = $1, last_name = $2, email = $3, password = $4
    WHERE user_id = $5
    `,
        [first_name, last_name, email, password, user_id]
    );
    return result.rows[0];
}

async function editProfile({ age, city, website }, { user_id }) {
    const result = await db.query(
        `UPDATE user_profiles
    SET age = $1, city = $2, website = $3
    WHERE user_id = $4`,
        [age, city, website, user_id]
    );
    return result.rows[0];
}

async function edit() {
    let promise = await Promise.all([editUser(), editProfile()]);
    return promise;
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

// SIGNER COUNT

/* async function userCount() {
    const result = await db.query(`SELECT COUNT(id) FROM signatures`);
    return result.rows;
} */

// edit profile

// delete Signer or complete profile

//
module.exports = {
    getSigners,
    getSignature,
    getUserById,
    signUp,
    createUser,
    login,
    createProfile,
    findCities,
    edit,
    deleteSignature,
    // deleteUser,
    // userCount,
};
