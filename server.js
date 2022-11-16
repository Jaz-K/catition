const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const {
    getSigners,
    getSignature,
    getUserById,
    getCurrentUserProfile,
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
    editPassword,
    /*  userCount, */
} = require("./db");

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

app.get("/catition", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/catition/sign");
    } else {
        res.render("register");
    }
});

app.post("/catition", async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        console.log("New User", newUser);
        req.session.user_id = newUser.id;
        res.redirect("/catition/more");
    } catch (error) {
        console.log("ERROR delete user", error);
        res.render("edit", {
            error: "Something went wrong, please try again",
        });
    }
});

app.get("/catition/more", async (req, res) => {
    console.log("req.session GET more", req.session);
    const { user_id } = req.session;
    if (!user_id) {
        res.redirect("/catition");
        return;
    }
    const userProfiles = await getCurrentUserProfile(user_id);
    // console.log("userProfiles", userProfiles);

    if (userProfiles == undefined) {
        res.render("more_infos");
    } else {
        res.redirect("/catition/sign");
    }
});

app.post("/catition/more", async (req, res) => {
    try {
        /* const url = req.body.website;
        if (!url.startWith("http://" || "http://")) {
            "http://" + url;
        } */
        console.log("session id more", req.session);
        await createProfile(req.body, req.session.user_id);
        // req.session.signatures_id = profile.id;
        res.redirect("/catition/sign");
    } catch (error) {
        console.log("POST profile error", error);
    }
});

app.get("/catition/profile", async (req, res) => {
    const { user_id } = req.session;
    const user = await getUserById(user_id);
    // console.log("edit", user_id);
    res.render("edit", { user });
});

app.post("/catition/profile/edit", async (req, res) => {
    try {
        /*    const url = req.body.website;
        if (!url.startWith("http://" || "http://")) {
            "http://" + url;
        }
 */
        const { user_id } = req.session;
        console.log("website body", req.body.website);

        await editUser({ ...req.body, user_id });
        await editProfile({ ...req.body, user_id });
        res.redirect("/catition/thank-you");
    } catch (error) {
        console.log("Error edituser", error);
        res.render("edit", {
            erroredit: "Something went wrong, please try again",
        });
    }
});

app.post("/catition/profile/delete", async (req, res) => {
    try {
        const { user_id } = req.session;
        await deleteUser(user_id);
        await deleteProfile(user_id);
        await deleteSignature(user_id);
        req.session = null;
        res.redirect("/catition");
    } catch (error) {
        console.log("ERROR delete user", error);
        res.render("edit", {
            errordel: "Something went wrong, please try again",
        });
    }
});

app.post("/catition/profile/change-password", async (req, res) => {
    try {
        const { user_id } = req.session;
        const { password, password_repeat } = req.body;
        const user = await getUserById(user_id);

        if (password !== password_repeat) {
            res.render("edit", {
                user,
                error: "The passwords are not the same, try again.",
            });
        }

        console.log(password, user_id);
        if (password === password_repeat) {
            await editPassword(password, user_id);
            console.log("They are the same");
            res.redirect("/catition/profile");
        }
    } catch (error) {
        console.log("ERROR change password", error);
        res.render("edit", {
            error: "Something went wrong, please try again",
        });
    }
});

app.get("/catition/login", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/catition/sign");
        return;
    }
    res.render("login");
});

app.post("/catition/login", async (req, res) => {
    try {
        const loggedUser = await login(req.body);
        req.session.user_id = loggedUser.id;

        const signature_id = await getSignature(loggedUser.id);
        if (signature_id) {
            const sigId = signature_id.id;
            req.session.signatures_id = sigId;
        }

        res.redirect("/catition/sign");
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

app.get("/catition/sign", async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const sig_id = req.session.signatures_id;
        console.log("req.session GET sign", req.session);
        // console.log("PETITION sig_id", req.session);
        if (!user_id) {
            res.redirect("/catition");
            return;
        }
        if (sig_id) {
            res.redirect("/catition/thank-you");
            return;
        }
        res.render("petition");
    } catch (error) {
        console.log("ERROR petition", error);
    }
});

app.post("/catition/sign", async (req, res) => {
    try {
        console.log("req.session sign post", req.session);
        const newSigner = await signUp(req.body, req.session);
        console.log("newSigner", newSigner);
        req.session.signatures_id = newSigner.id;
        // console.log("SESSION", req.session);
        res.redirect("/catition/thank-you");
    } catch (error) {
        console.log("ERROR petition POST", error);
        res.render("petition", {
            error: "Please sign the petition before you submit!",
        });
    }
});

app.get("/catition/thank-you", async (req, res) => {
    try {
        const { user_id } = req.session;
        const { signatures_id } = req.session;
        // console.log("signature id GET THANK YOU", signature_id);
        if (!user_id) {
            res.redirect("/catition");
            return;
        }
        if (!signatures_id) {
            res.redirect("/catition/sign");
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

app.post("/catition/thank-you/delete-sig", async (req, res) => {
    console.log("POST thank you", req.session);
    try {
        const { user_id } = req.session;
        // console.log("signatures_id", signatures_id);
        await deleteSignature(user_id);
        req.session.signatures_id = null;
        res.redirect("/catition/sign");
    } catch (error) {
        console.log("ERROR thank you", error);
    }
});

app.get("/catition/signers", async (req, res) => {
    const signers = await getSigners();
    res.render("signers", { signers });
    // console.log("response", res);
});

app.get("/catition/signers/:city", async (req, res) => {
    const { city } = req.params;
    // console.log("PARAMS", city);

    const foundCity = await findCities(city);
    // console.log(foundCity);
    res.render("cityUser", { city: city, foundCity });
    // res.render("cityUser");
});

app.get("/catition/logout", (req, res) => {
    (req.session = null), res.redirect("/catition");
});

app.all("*", (req, res) => {
    res.status(404).render("pageNotFound");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("The Server is listen to 8080")
);
// app.listen(8080, () => console.log("The Server is listen to 8080"));
