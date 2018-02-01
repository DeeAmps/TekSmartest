const express = require('express');
const path = require('path');
const fs = require("fs");
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors");
const clientRoute = require("./routes/clientRoute");
const adminRoute = require("./routes/adminRoute");
const questionModel = require("./models/questionsSchema");
const contestantPointsModel = require("./models/contestantPointsSchema");


mongoose.connect("mongodb://localhost:27017/TEKSmartest", (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log("Connection Success!");
});


let totalPoints = 0;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", clientRoute);
app.use("/admin", adminRoute);

io.on('connection', (socket) => {

    socket.on('addUser', (obj) => {
        io.emit('activeContestants', { name: obj.name });
    });

    socket.on('StartQuiz', () => {
        questionModel.find({}).limit(5).exec((err, results) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            io.emit('QuizQuestions', { questions: results, count: 5 });
            io.emit('QuizStarted');
        })
    });

    socket.on('EndQuizForAll', () => {
        socket.broadcast.emit('TimerUpEndQuiz');
    });

    socket.on('QuizSubmission', (obj) => {
        GetPoints(obj).then(res => {
            contestantPointsModel.findOne({ Name: obj.name }, (err, points) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
                if (points != null) {
                    points.TotalPoints += res;
                    points.save((err) => {
                        if (err) {
                            console.log(err);
                            process.exit(1);
                        }
                        questionModel.find({}).limit(5).skip(obj.count).exec((err, results) => {
                            if (err) console.log(err);
                            io.emit('QuizQuestions', { questions: results, count: obj.count + 5 });
                        })
                    });
                } else {
                    let points = new contestantPointsModel();
                    points.Name = obj.name;
                    points.TotalPoints = res;
                    points.save((err) => {
                        if (err) {
                            console.log(err);
                            process.exit(1);
                        }
                        questionModel.find({}).limit(5).skip(obj.count).exec((err, results) => {
                            if (err) console.log(err);
                            if (results == null) {
                                io.emit('QuizEnd');
                            } else {
                                io.emit('QuizQuestions', { questions: results, count: obj.count + 5 });
                            }
                        })
                    })
                }
            });
        });
    })
});

async function GetPoints(obj) {
    for (const element of obj.answers) {
        await questionModel.findOne({ "_id": element.QuestionId }, (err, results) => {
            if (element.SelectedAnswer == results.CorrectAnswer) {
                totalPoints += 1;
            }
        })
    }
    return totalPoints;
}

server.listen(3000, () => {
    console.log(`http://localhost:3000`)
});