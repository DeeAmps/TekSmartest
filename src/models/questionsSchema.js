const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    Question: String,
    Option1: String,
    Option2: String,
    Option3: String,
    Option4: String,
    CorrectAnswer: String
});

const questionsModel = mongoose.model("questions", questionSchema);
module.exports = questionsModel;