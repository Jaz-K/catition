const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const { getSigners, getSigner, signUp, createUser, login } = require("./db");

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

const { SESSION_SECRET } = require("./secret.json");
app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        req.session.user_id = newUser.id;
        res.redirect("/petition");
    } catch (error) {
        console.log("ERROR register", error);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const loggedUser = await login(req.body);
        if (!loggedUser) {
            return;
        }
        req.session.user_id = loggedUser.id;
        res.redirect("/petition");
    } catch (error) {
        console.log("ERROR login POST", error);
    }
});

app.get("/petition", (req, res) => {
    const signature_id = req.session.signatures_id;
    // const signature_id = req.session.user_id;
    if (signature_id) {
        res.redirect("/petition/thank-you");
        return;
    }
    // console.log("response", res);
    res.render("petition");
});

app.post("/petition", async (req, res) => {
    console.log("POST petition", req.session);
    // console.log("body log", req.body.signature);
    try {
        const newSigner = await signUp(req.body, req.session);
        console.log("newSigner", newSigner);
        req.session.signatures_id = newSigner.id;
        // console.log("SESSION", req.session);
        res.redirect("/petition/thank-you");
    } catch (error) {
        console.log("error", error);
        res.render("petition", {
            error: "Please sign the petition before you submit!",
        });
    }
});

app.get("/petition/thank-you", async (req, res) => {
    const signature_id = req.session.user_id;
    // console.log("signature id GET THANK YOU", signature_id);
    if (!req.session.user_id) {
        res.redirect("/petition");
    }
    try {
        const signer = await getSigner(signature_id);
        // console.log(signer);
        const signers = await getSigners();
        // console.log(signers);
        // console.log("response", res);
        res.render("thankyou", { signers, signer });
    } catch (error) {
        console.log("ERROR", error);
    }
});

app.get("/petition/signers", async (req, res) => {
    const signers = await getSigners();
    res.render("signers", { signers });
    // console.log("response", res);
});

app.listen(8080, () => console.log("The Server is listen to 8080"));
