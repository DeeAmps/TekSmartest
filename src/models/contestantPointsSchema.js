const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestantPointsSchema = new Schema({
    Name: String,
    TotalPoints: Number,
});

const contestantPointsModel = mongoose.model("points", contestantPointsSchema);
module.exports = contestantPointsModel;