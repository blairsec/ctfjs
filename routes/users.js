module.exports = function (ctf) {
    const express = require("express");
    const passport = require("passport");
    const User = require("../models/user");
    const router = express.Router();

    const {body, validationResult} = require("express-validator");

    // register a user
    router.post(
        "/",
        [
            body("username")
                .isString()
                .trim()
                .isLength({min: 1, max: 50})
                .matches(/^[A-Za-z0-9_]+$/),
            body("password").isString().isLength({min: 8}),
            body("email")
                .isString()
                .trim()
                .matches(/^\S+@\S+\.\S+$/),
            body("eligible").isBoolean(),
        ],
        async (req, res) => {
            // check if data was valid
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "invalid_values"});
            }
            await ctf.emitBefore("createUser", req);
            try {
                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    eligible: req.body.eligible,
                    competition: req.competition,
                    password: req.body.password,
                });
                await user.save();
                await ctf.emitAfter("createUser", req, {user: user});
                res.sendStatus(201);
            } catch (error) {
                res.status(409).json({message: "username_email_conflict"});
            }
        }
    );

    // get a list of users
    router.get("/", async (req, res, next) => {
        await ctf.emitBefore("getUsers", req);
        passport.authenticate("jwt", {session: false}, async function (
            err,
            self
        ) {
            if (err) {
                throw err;
            }
            const users = await User.findSerialized(
                {competition: req.competition},
                {emails: self.admin, teams: true}
            );
            await ctf.emitAfter("getUsers", req, {users: users});
            res.json(users);
        })(req, res, next);
    });

    // get info about a user
    router.get("/:user", async (req, res, next) => {
        if (isNaN(req.params.user)) {
            return res.status(404).json({message: "user_not_found"});
        }
        await ctf.emitBefore("getUser", req);
        try {
            const user = await User.findOneSerialized({
                id: req.params.user,
                competition: req.competition,
            });
            await ctf.emitAfter("getUser", req, {user: user});
            const userNotFoundError = "user_not_found";
            if (user) {
                res.json(user);
            } else {
                throw userNotFoundError;
            }
        } catch (err) {
            res.status(404).json({message: "user_not_found"});
        }
    });

    // modify a user
    router.patch(
        "/:user",
        [
            body("username")
                .isString()
                .trim()
                .isLength({min: 1, max: 50})
                .matches(/^[A-Za-z0-9_]+$/)
                .optional(),
            body("email")
                .isString()
                .trim()
                .matches(/^\S+@\S+\.\S+$/)
                .optional(),
            body("eligible").isBoolean().optional(),
        ],
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            let errors = validationResult(req);
            errors = errors.array().map((e) => e.param);
            if (isNaN(req.params.user)) {
                return res.status(404).json({message: "user_not_found"});
            }

            if (errors.length > 0) {
                return res.status(400).json({message: "invalid_values"});
            }

            await ctf.emitBefore("modifyUser", req);
            req.params.user = parseInt(req.params.user);
            if (req.user.admin === true || req.user.id === req.params.user) {
                const user = await User.findOne({
                    competition: req.competition,
                    id: req.params.user,
                });
                if (user) {
                    if (req.body.email && errors.indexOf("email") === -1) {
                        user.email = req.body.email;
                    }
                    if (
                        req.body.username &&
                        errors.indexOf("username") === -1
                    ) {
                        user.username = req.body.username;
                    }
                    if (
                        req.body.eligible !== undefined &&
                        errors.indexOf("eligible") === -1
                    ) {
                        user.eligible = req.body.eligible;
                    }
                    try {
                        await user.save();
                        await ctf.emitAfter("modifyUser", req, {user: user});
                        res.sendStatus(204);
                    } catch (err) {
                        res.status(409).json({
                            message: "username_email_conflict",
                        });
                    }
                } else {
                    res.status(404).json({message: "user_not_found"});
                }
            } else {
                res.status(403).json({message: "action_forbidden"});
            }
        }
    );

    return router;
};
