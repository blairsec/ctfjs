module.exports = function (ctf) {
    const express = require("express");
    const passport = require("passport");
    const User = require("../models/user");
    const jwt = require("jsonwebtoken");
    const router = express.Router();

    const {body, validationResult} = require("express-validator");

    // create an admin
    router.post(
        "/",
        [
            body("username").isString().trim().isLength({min: 1}),
            body("password").isString().isLength({min: 8}),
            body("email")
                .isString()
                .trim()
                .matches(/^\S+@\S+\.\S+$/),
        ],
        async (req, res, next) => {
            passport.authenticate("jwt", {session: false}, async function (
                err,
                user
            ) {
                if (err) {
                    throw err;
                }
                // check if data was valid
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({message: "invalid_values"});
                }
                const admins = await User.findSerialized({admin: true});
                if ((user && user.admin === true) || admins.length === 0) {
                    await ctf.emitBefore("createAdmin", req, {
                        currentUser: user,
                    });
                    user = new User({
                        username: req.body.username,
                        email: req.body.email,
                        eligible: false,
                        admin: true,
                        password: req.body.password,
                        competition: null,
                    });
                    try {
                        await user.save();
                        await ctf.emitAfter("createAdmin", req);
                        res.sendStatus(201);
                    } catch (error) {
                        res.status(409).json({
                            message: "username_email_conflict",
                        });
                    }
                } else {
                    res.status(403).json({message: "action_forbidden"});
                }
            })(req, res, next);
        }
    );

    // view admins
    router.get("/", async (req, res) => {
        const admins = await User.findSerialized({admin: true}, {team: false});
        res.json(admins);
    });

    // delete admin
    router.delete(
        "/:id",
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            if (req.user.admin === true) {
                await User.delete({id: req.params.id, admin: true});
                res.sendStatus(204);
            } else {
                req.sendStatus(403).json({message: "action_forbidden"});
            }
        }
    );

    // give authentication token
    router.post(
        "/auth",
        passport.authenticate("local", {session: false}),
        async (req, res) => {
            if (req.user.admin === true) {
                const token = jwt.sign(
                    {id: req.user.id, admin: true},
                    req.jwt_secret
                );
                res.cookie("token", token).json({token: token});
            } else {
                res.sendStatus(401);
            }
        }
    );

    return router;
};
