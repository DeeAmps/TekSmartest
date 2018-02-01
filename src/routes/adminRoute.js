const express = require("express");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const adminModel = require("../models/adminSchema");
const questionModel = require("../models/questionsSchema");
const router = express.Router();
const loggedIn = require("../config/authenticate").loggedIn;
const contestantPointsModel = require("../models/contestantPointsSchema");


router.get('/', loggedIn, (req, res) => {
    res.render("Admin/home", { username: req.decoded.username })
});

router.get('/questions', loggedIn, (req, res) => {
    res.render("Admin/addquestions", { username: req.decoded.username, feedback: false, err: false })
});

router.get('/deletequestion/:id', loggedIn, (req, res) => {
    questionModel.findByIdAndRemove({ _id: req.params.id }, (err) => {
        questionModel.find({}, (err, data) => {
            res.render("Admin/viewquestions", { username: req.decoded.username, questions: data })
        });
    })
});

router.get('quiz_scores', loggedIn, (req, res) => {
    contestantPointsModel.find({}, (err, data) => {
        questionModel.count({}, (err, count) => {
            res.render("Admin/quiz_scores", { username: req.decoded.username, scores: data, totalCount: count })
        })
    })
});

router.get('/editquestion/:id', loggedIn, (req, res) => {
    questionModel.findById({ _id: req.params.id }, (err, data) => {
        console.log(data);
        return res.render("Admin/editquestion", { username: req.decoded.username, feedback: false, err: false, data: data })
    });
});

router.post('/editquestion/:id', loggedIn, (req, res) => {
    questionModel.findById({ _id: req.params.id }, (err, data) => {

        let question = req.body.question;
        let option1 = req.body.option1;
        let option2 = req.body.option2;
        let option3 = req.body.option3;
        let option4 = req.body.option4;
        let answer = req.body.answer;
        console.log(data);
        data.Question = question;
        data.Option1 = option1;
        data.Option2 = option2;
        data.Option3 = option3;
        data.Option4 = option4;
        data.CorrectAnswer = answer;
        data.save((err) => {
            questionModel.find({}, (err, data) => {
                res.render("Admin/viewquestions", { username: req.decoded.username, questions: data });
            })
        });


    });

});


router.get('/view_questions', loggedIn, (req, res) => {
    questionModel.find({}, (err, data) => {
        res.render("Admin/viewquestions", { username: req.decoded.username, questions: data });
    })

});

router.post('/questions', loggedIn, (req, res) => {
    let question = req.body.question;
    let option1 = req.body.option1;
    let option2 = req.body.option2;
    let option3 = req.body.option3;
    let option4 = req.body.option4;
    let answer = req.body.answer;

    let newQuestion = new questionModel();
    newQuestion.Question = question;
    newQuestion.Option1 = option1;
    newQuestion.Option2 = option2;
    newQuestion.Option3 = option3;
    newQuestion.Option4 = option4;
    newQuestion.CorrectAnswer = answer;

    newQuestion.save((err) => {
        if (err) {
            res.render("Admin/addquestions", { username: req.decoded.username, feedback: false, err: "An error occured whilst saving the question." })
        } else {
            res.render("Admin/addquestions", { username: req.decoded.username, feedback: "New Question Added!", err: false })
        }
    })
});

router.get('/login', (req, res) => {
    res.render("Admin/login", { err: false, feedback: false })
});

router.get('/logout', (req, res) => {
    res.clearCookie("TEKAuth");
    res.render("Admin/login", { err: false, feedback: false })
});

router.post('/api/register', (req, res) => {
    if (!req.body.username && !req.body.password) {
        return res.json({ success: false, message: "Username and Password required to register!" });
    } else {
        adminModel.findOne({ username: req.body.username }, (err, user) => {
            if (user) {
                return res.json({ success: false, message: "Username already exists!" });
            }
            if (err) {
                return res.json({ success: false, message: err });
            }
            var newAdmin = new adminModel();
            newAdmin.username = req.body.username;
            newAdmin.password = encrypt(req.body.password);
            newAdmin.save((err, user) => {
                if (user) {
                    return res.json({ message: "Admin registered successfully!" });
                }
                if (err) {
                    return res.json({ message: err });
                }
            })
        })
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("TEKAuth");
    return res.render("Admin/login", { err: false, feedback: false })
});

router.post('/login', (req, res) => {
    adminModel.findOne({ username: req.body.username }, (err, data) => {
        if (err) {
            return res.render("Admin/login", { err: "An unexpected error occurred!", feedback: false });
        }
        if (!data) {
            return res.render("Admin/login", { err: "Username/Password incorrect!", feedback: false });
        }
        if (data) {
            let verifyPassword = comparePassword(req.body.password, data.password);
            if (verifyPassword) {
                let token = createToken(data);
                res.cookie("TEKAuth", token, { maxAge: 43200000 });
                return res.redirect(301, "/admin/home");

            } else {
                return res.render("Admin/login", { err: "Username/Password incorrect!", feedback: false });
            }
        }
    })
});

router.get("/home", loggedIn, (req, res) => {
    res.render("Admin/home", { username: req.decoded.username })
})

function comparePassword(userPasswordInput, hashedPassword) {
    return bcrypt.compareSync(userPasswordInput, hashedPassword);
};

function encrypt(password) {
    return bcrypt.hashSync(password, 10);
};

function createToken(data) {
    return jwt.sign(data.toJSON(), "#T3KSM4RT35T#", {
        expiresIn: "12h"
    });
};

module.exports = router;