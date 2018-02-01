const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render("Client/index")
});

router.get('/quizhome', (req, res) => {
    var name = req.query.name;
    console.log(name)
    res.render("Client/quizhome", { name: name });
})

module.exports = router;