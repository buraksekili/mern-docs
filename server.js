const express = require("express");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// app.use(cors());

// app.use(cors({ credentials: true }));
app.use(cookieParser());
// body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("./routes/api/users"));
// app.use(require("./routes/api/docs"));

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

// db config
const db = process.env.mongoURI;
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected"))
    .catch((e) => console.log("error: ", e));

// user login routers
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server is on port:${port}`));
