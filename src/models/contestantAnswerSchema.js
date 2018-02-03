const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestantAnswerSchema = new Schema({
    Question: String,
    Name: String,
    ChosenAnswer: String,
    CorrectAnswer: String,
});

const contestantAnswerModel = mongoose.model("answers", contestantAnswerSchema);
module.exports = contestantAnswerModel;