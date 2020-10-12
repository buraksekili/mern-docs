const express = require("express");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("./routes/api/users"));

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
  .catch((e) => console.log("error:", e));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server is on port:${port}`));
