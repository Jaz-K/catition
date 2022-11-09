const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const { getSigner, signUp } = require("./db");

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

app.get("/petition", (req, res) => {
    // console.log("response", res);
    res.render("petition");
});
app.post("/petition", async (req, res) => {
    console.log("POST", req.body);
    // console.log("body log", req.body.signature);
    try {
        await signUp(req.body);
        req.session.signatures_id = req.body.id;
        res.redirect("/petition/thank-you");
    } catch (error) {
        console.log("error", error);
        res.render("petition", {
            error: "Please sign the petition before you submit!",
        });
    }
});

app.get("/petition/thank-you", async (req, res) => {
    if (!req.session.signature_id) {
        res.redirect("/petition");
    }
    const signer = await getSigner();
    // console.log("response", res);
    res.render("thankyou", { signer });
});

app.get("/petition/signers", async (req, res) => {
    const signer = await getSigner();
    res.render("signers", { signer });
    // console.log("response", res);
});

app.listen(8080, () => console.log("The Server is listen to 8080"));
