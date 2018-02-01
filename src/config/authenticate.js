const jwt = require("jsonwebtoken");
exports.loggedIn = function(req, res, next) {
    let token = req.cookies.TEKAuth;
    if (token === undefined) {
        return res.render("Admin/login", { err: false, feedback: false });
    } else {
        jwt.verify(token, "#T3KSM4RT35T#", (err, decoded) => {
            if (err) {
                return res.render("Admin/login", { err: err, feedback: false })
            } else {
                req.decoded = decoded
                next();
            }
        })
    }

}