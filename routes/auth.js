module.exports = function (ctf) {
    const express = require("express");
    const passport = require("passport");
    const jwt = require("jsonwebtoken");
    const router = express.Router();

    // give authentication token (requires username and password in request body)
    router.post(
        "/",
        passport.authenticate("local", {session: false}),
        async (req, res) => {
            await ctf.emitBefore("createAuth", req);
            const token = jwt.sign(
                {id: req.user.id, competition: req.competition},
                req.jwt_secret
            );
            await ctf.emitAfter("createAuth", req, {token: token});
            res.json({token: token});
        }
    );

    return router;
};
