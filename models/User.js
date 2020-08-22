const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { DocumentSchema } = require("./Document");

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid.");
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
    },
    signup_date: {
        type: Date,
        default: Date.now(),
    },

    documents: {
        type: [DocumentSchema],
    },

    token: {
        type: String,
        required: true,
    },
});

// userSchema.statics is accessible by model
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw Error("User does not exist.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw Error("Unable to login");
    }

    return user;
};

UserSchema.methods.getJWT = async function () {
    try {
        const token = jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
            expiresIn: 3600,
        });
        this.token = token;
        await this.save();
        return token;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
