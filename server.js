const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const {
    getSigners,
    getSignature,
    getUserById,
    signUp,
    createUser,
    login,
    createProfile,
    findCities,
    deleteSignature,
    deleteUser,
    deleteProfile,
    editUser,
    editProfile,
    // edit,
    /*  userCount, */
} = require("./db");

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

const { SESSION_SECRET } = require("./secret.json");
// const { profile } = require("console");
// const { url } = require("inspector");
app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/register", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/profile");
    } else {
        res.render("register");
    }
});

app.post("/register", async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        req.session.user_id = newUser.id;
        res.redirect("/profile");
    } catch (error) {
        console.log("ERROR register", error);
    }
});

app.get("/profile", (req, res) => {
    if (!req.session.user_id) {
        res.redirect("/register");
    } else {
        res.render("profile");
    }
});

app.post("/profile", async (req, res) => {
    try {
        /* if (!url.startWith("http://")) {
            "http://" + url;
        } */
        // console.log("PROFILE POST", req.session);
        const profile = await createProfile(req.body, req.session.user_id);
        req.session.user_id = profile.id;
        res.redirect("/petition");
    } catch (error) {
        console.log("POST profile error", error);
    }
});

app.get("/profile/edit", async (req, res) => {
    const { user_id } = req.session;
    const user = await getUserById(user_id);
    // console.log("edit", user_id);
    res.render("edit", { user });
});

app.post("/profile/edit", async (req, res) => {
    // console.log("POST edit", req.body, req.session);
    try {
        const { user_id } = req.session;
        await editUser({ ...req.body, user_id });
        await editProfile({ ...req.body, user_id });
        res.redirect("/petition/thank-you");
    } catch (error) {
        console.log("Error edituser", error);
    }
});

app.post("/profile/delete", async (req, res) => {
    try {
        const { user_id } = req.session;
        await deleteUser(user_id);
        await deleteProfile(user_id);
        await deleteSignature(user_id);
        req.session = null;
        res.redirect("/register");
    } catch (error) {
        console.log("ERROR delete user", error);
    }
});

app.get("/login", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/petition");
        return;
    }
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const loggedUser = await login(req.body);
        req.session.user_id = loggedUser.id;

        const signature_id = await getSignature(loggedUser.id);
        const sigId = signature_id.id;
        req.session.signatures_id = sigId;

        res.redirect("/petition");
        return;
    } catch (error) {
        console.log("ERROR login POST", error);
        const { email, password } = req.body;
        res.render("login", {
            error: "Incorrect email or password, please try again",
            email,
            password,
        });
    }
});

app.get("/petition", async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const sig_id = req.session.signatures_id;

        // console.log("PETITION sig_id", req.session);
        if (!user_id) {
            res.redirect("/register");
            return;
        }
        if (sig_id) {
            res.redirect("/petition/thank-you");
            return;
        }

        res.render("petition");
    } catch (error) {
        console.log("ERROR petition", error);
    }
});

app.post("/petition", async (req, res) => {
    // console.log("POST petition", req.session);
    // console.log("body log", req.body.signature);
    try {
        const newSigner = await signUp(req.body, req.session);
        // console.log("newSigner", newSigner);
        req.session.signatures_id = newSigner.id;
        // console.log("SESSION", req.session);
        res.redirect("/petition/thank-you");
    } catch (error) {
        console.log("ERROR petition POST", error);
        res.render("petition", {
            error: "Please sign the petition before you submit!",
        });
    }
});

app.get("/petition/thank-you", async (req, res) => {
    try {
        const { user_id } = req.session;
        const { signatures_id } = req.session;
        // console.log("signature id GET THANK YOU", signature_id);
        if (!user_id) {
            res.redirect("/register");
            return;
        }
        if (!signatures_id) {
            res.redirect("/petition");
            return;
        }
        const signature = await getUserById(user_id); //!!!! rename variable
        // console.log(signer);
        // const signers = await getSigners();
        const signers = await getSigners();
        // console.log(signers);
        // console.log(await userCount());
        // console.log("response", res);
        res.render("thankyou", { signers, signature });
    } catch (error) {
        console.log("ERROR GET thank you", error);
    }
});

app.post("/petition/thank-you", async (req, res) => {
    console.log("POST thank you", req.session);
    try {
        const { user_id } = req.session;
        // console.log("signatures_id", signatures_id);
        await deleteSignature(user_id);
        req.session.signatures_id = null;
        res.redirect("/petition");
    } catch (error) {
        console.log("ERROR thank you", error);
    }
});

app.get("/petition/signers", async (req, res) => {
    const signers = await getSigners();
    res.render("signers", { signers });
    // console.log("response", res);
});

app.get("/petition/signers/:city", async (req, res) => {
    const { city } = req.params;
    // console.log("PARAMS", city);

    const foundCity = await findCities(city);
    // console.log(foundCity);
    res.render("cityUser", { city: city, foundCity });
    // res.render("cityUser");
});

app.get("/logout", (req, res) => {
    // console.log("logout", req.session);
    (req.session = null), res.redirect("/register");
});

app.listen(8080, () => console.log("The Server is listen to 8080"));
