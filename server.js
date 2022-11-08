const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/petition", (req, res) => {
    console.log("response", res);
    res.render("petition");
});

app.listen(8080, () => console.log("The Server is listen to 8080"));
