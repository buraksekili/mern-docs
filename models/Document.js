const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
    content: {
        type: String,
    },
    title: {
        type: String,
    },
});

const Document = mongoose.model("Document", DocumentSchema);
module.exports = { Document, DocumentSchema };
