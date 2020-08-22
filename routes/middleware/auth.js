const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const auth = async (req, res, next) => {
    try {
        // const token = req.cookies["Set-Cookie"].replace("auth=", "");
        // const token = req.header("Authorization").replace("Bearer ", "");
        const token = req.cookies.token;

        if (!token) {
            res.status(401).send({ msg: "no token authorization" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await (await User.findById(decoded.id)).toObject();
        if (!user) {
            throw new Error("no user");
        }
        delete user.password;
        req.token = token; //?
        req.user = user;
    } catch (error) {
        res.status(401).json({ msg: "Authentication error", error });
    }

    next();
};

module.exports = auth;
