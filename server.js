const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const { getSigner, signUp } = require("./db");

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/petition", (req, res) => {
    // console.log("response", res);
    res.render("petition");
});
app.post("/petition", async (req, res) => {
    // console.log("POST", req.body);
    // console.log("body log", req.body.signature);
    try {
        await signUp(
            req.body.first_name,
            req.body.last_name,
            req.body.signature
        );
        res.redirect("/petition/thank-you");
    } catch (error) {
        console.log("error", error);
        res.render("petition", { error: "Something went wrong" });
    }
});

app.get("/petition/thank-you", (req, res) => {
    // console.log("response", res);
    res.render("thankyou");
});

app.get("/petition/signers", (req, res) => {
    getSigner().then((signer) => res.render("signers", { signer }));
    // console.log("response", res);
});

app.listen(8080, () => console.log("The Server is listen to 8080"));
