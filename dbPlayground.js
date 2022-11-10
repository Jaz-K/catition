const { createUser, login } = require("./db");
/* 
login({ email: "non-existing@example.com", password: "..." }).then(
    (loggedUser) => console.log(loggedUser)
);

login({ email: "first@example.com", password: "wrong" }).then((loggedUser) =>
    console.log(loggedUser)
);

login({ email: "first@example.com", password: "first" }).then((loggedUser) =>
    console.log(loggedUser)
); */

createUser({
    email: "first@example.de",
    first_name: "first",
    last_name: "last",
    password: "first",
}).then((newUser) => {
    console.log("newUser", newUser);
});

/* createUser({
    first_name: "Susi",
    last_name: "Testify",
    email: "susi@mail.com",
    password: "first",
}).then((newUser) => {
    console.log("newUser", newUser);
}); */

/* const { hash, genSalt, compare } = require("bcryptjs");

async function hashPassword(password) {
    const salt = await genSalt();
    return hash(password, salt);
}

const users = [
    {
        id: 1,
        email: "first@mail.de",
        password_hash:
            "$2a$10$3ccwdPGrbbvrQLy4w4.Aq.CmZU7CE8SctPymsvAGScXmaJ.b8At8u",
    },
    {
        id: 2,
        email: "second@mail.de",
        password_hash:
            "$2a$10$I4svkq9nRH/QlYiLbXAxGOSrswwco.S6e/A/nfUKShoKtY2w2lZ4e",
    },
    {
        id: 3,
        email: "third@mail.de",
        password_hash:
            "$2a$10$BkNbd7/ErGgxrlE7RuhE9Oxq1lIz8UDtBo.P.SBzIjnEMAUGheCoa",
    },
];

users.forEach(async (user) => {
    const password_hash = await hashPassword(user.password);
    // console.log(user.password, password_hash);
});

// console.log("users", users);

async function login({ email, password }) {
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
}

 login({ email: "non-existing@example.com", password: "..." }).then(
    (loggedUser) => console.log(loggedUser)
);
login({ email: "first@mail.de", password: "wrong" }).then((loggedUser) =>
    console.log(loggedUser)
); 
login({ email: "first@mail.de", password: "first" }).then((loggedUser) =>
    console.log("logged USer", loggedUser)
);

const check = login({
    email: "first@mail.com",
    password: "first",
});

console.log("check", check);  */
