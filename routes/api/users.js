const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const auth = require("../middleware/auth");
const User = require("../../models/User");
const { Document } = require("../../models/Document");
const router = new express.Router();

function ServerLog(callerFunc, lineNumbers, msg) {
  console.log(`${callerFunc}:${lineNumbers}:${currEmail}\t=> ${msg}\n`);
}
let currEmail = "";

router.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "please enter all fields" });
  }

  User.findOne({ email })
    .then((user) => {
      // if user exists, return error
      if (user) {
        return res.status(400).json({ msg: "User already exists." });
      }

      // create new user
      const newUser = new User({ email, password });
      ServerLog("/signup", "29", `${email} ${password} registered`);
      // hash the user password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) throw err;

          // now, user's password become hashed one.
          newUser.password = hash;
          await newUser.getJWT();
          res.send(newUser);
        });
      });
    })
    .catch((e) =>
      res.status(400).json({
        error: e,
      })
    );
});

router.post("/login", async (req, res) => {
  console.log("/login");
  const { email, password } = req.body;
  currEmail = email;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.getJWT();

    await res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
      })
    );

    const newUser = user.toObject();
    delete newUser.password;

    ServerLog("/login", "66", email + " is logged in!");

    res.send({ token, user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await res.clearCookie("token");

    ServerLog("/logout", 76, "logged out");
    currEmail = "";

    res.send(true);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/create", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const doc = new Document();
    user.documents = user.documents.concat({
      _id: doc._id,
      content: doc.content,
    });
    await user.save();
    res.send(doc._id);
  } catch (error) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.post("/save", auth, async (req, res) => {
  try {
    const serialized = req.body.serialized;
    const title = req.body.title;
    const user = await User.findById(req.user._id);

    docId = req.body.doc_id;

    if (docId) {
      let isFound = false;
      user.documents.forEach((doc) => {
        if (doc._id == docId) {
          doc.content = serialized;
          doc.title = title;
          isFound = true;
        }
      });

      if (!isFound) {
        user.documents = await user.documents.concat({
          _id: docId,
          content: serialized,
          title,
        });
      }
    } else {
      const doc = new Document({ content: serialized });
      user.documents = user.documents.concat({
        _id: doc._id,
        content: doc.content,
        title,
      });
    }
    // const doc = new Document({ content: serialized });

    ServerLog("/save", "133", "saves current doc.");

    await user.save();
    res.send(true);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/getdocs", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    ServerLog("/getdocs", "154", "displays dashboard");
    res.send(user.documents);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/getdoc", auth, async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById(req.user._id);
    var docum = null;
    user.documents.forEach((doc) => {
      if (doc.id === id) {
        docum = doc;
        return;
      }
    });

    ServerLog("/getdoc", "174", `got doc: ${docum._id}`);

    res.send(docum);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/checkauth", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send({ msg: "no token authorization" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await (await User.findById(decoded.id)).toObject();
    if (!user) {
      return res.status(401).json({ msg: "No such a user" });
    }

    delete user.password;
    delete user.signup_date;

    ServerLog("/checkauth", "189", user.email + " is authenticated!");

    return res.status(200).json(user);
  } catch (error) {
    console.log("error: ", error.message);
    res.status(401).json({ msg: "Authentication error", error });
  }
});

router.get("/deletetask", auth, async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById(req.user._id);

    for (let index = 0; index < user.documents.length; index++) {
      let doc = user.documents[index];
      if (doc.id === id) {
        user.documents.splice(index, 1);
        break;
      }
    }
    await user.save();

    ServerLog("/deletetask", 225, `deleting task with id:${id}`);

    res.send(user.documents);
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
