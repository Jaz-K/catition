const spicedPg = require("spiced-pg");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secret.json");
const DATABASE_NAME = "spiced-petition";
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

function getSigner() {
    return db.query(`SELECT * FROM signatures`).then((result) => result.rows);
}
// sign up

function signUp(first_name, last_name, signature) {
    return db
        .query(
            `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES($1,$2,$3,$4)
    `,
            [first_name, last_name, signature]
        )
        .then((result) => result.row[0]);
}

// edit profile

// delete Signer or complete profile

//
module.exports = {
    getSigner,
    signUp,
};
