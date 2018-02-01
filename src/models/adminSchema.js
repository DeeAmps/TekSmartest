const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: String,
    password: String
});

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;