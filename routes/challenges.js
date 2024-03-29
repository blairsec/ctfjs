module.exports = function (ctf) {
    const express = require("express");
    const passport = require("passport");
    const Team = require("../models/team");
    const Challenge = require("../models/challenge");
    const Submission = require("../models/submission");
    const MutexSet = require("../utils/MutexSet");
    const router = express.Router();

    const {body, validationResult} = require("express-validator");

    const ms = new MutexSet();

    // get a list of challenges
    router.get("/", ctf.competitionStarted, async (req, res, next) => {
        passport.authenticate("jwt", {session: false}, async function (
            err,
            user
        ) {
            req.user = user;
            if (err) {
                throw err;
            }
            const options = {};
            if (user && user.admin === true) {
                options.showDisabled = true;
                options.includeFlag = true;
            }
            await ctf.emitBefore("getChallenges", req);
            const challenges = await Challenge.findSerialized(
                {competition: req.competition},
                options
            );
            await ctf.emitAfter("getChallenges", req, {challenges: challenges});
            res.json(challenges);
        })(req, res, next);
    });

    router.get("/:id", ctf.competitionStarted, async (req, res, next) => {
        passport.authenticate("jwt", {session: false}, async function (
            err,
            user
        ) {
            req.user = user;
            if (err) {
                throw err;
            }
            const options = {};
            if (user && user.admin === true) {
                options.showDisabled = true;
                options.includeFlag = true;
            }
            await ctf.emitBefore("getChallenge", req);
            const challenge = await Challenge.findOneSerialized(
                {id: req.params.id, competition: req.competition},
                options
            );
            await ctf.emitAfter("getChallenge", req, {challenge: challenge});
            if (challenge) {
                res.json(challenge);
            } else {
                res.status(404).json({message: "challenge_not_found"});
            }
        })(req, res, next);
    });

    // create a challenge
    router.post(
        "/",
        [
            body("title").isString().isLength({min: 1}),
            body("description").isString().isLength({min: 1}),
            body("value").isNumeric(),
            body("author").isString().isLength({min: 1}),
            body("flag").isString().isLength({min: 1}),
            body("hint").isString().isLength({min: 1}).optional(),
            body("category").isString().isLength({min: 1}),
            body("enabled").isBoolean(),
        ],
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            if (req.user.admin) {
                // check if data was valid
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({message: "invalid_values"});
                }
                await ctf.emitBefore("createChallenge", req);
                const challenge = new Challenge({
                    title: req.body.title,
                    description: req.body.description,
                    value: parseInt(req.body.value),
                    author: req.body.author,
                    flag: req.body.flag,
                    category: req.body.category,
                    competition: parseInt(req.competition),
                    enabled: req.body.enabled,
                });
                if (req.body.hint) {
                    challenge.hint = req.body.hint;
                }
                await challenge.save();
                await ctf.emitAfter("createChallenge", req, {
                    challenge: challenge,
                });
                res.sendStatus(201);
            } else {
                res.status(403).json({message: "action_forbidden"});
            }
        }
    );

    // submit flag
    router.post(
        "/:id/submissions",
        [body("flag").isString().isLength({min: 1})],
        ctf.competitionStarted,
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            if (req.user.team) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({message: "invalid_values"});
                }
                try {
                    await ctf.emitBefore("submitFlag", req);
                    const challenge = await Challenge.findOne({
                        competition: req.competition,
                        id: req.params.id,
                        enabled: true,
                    });
                    const challegeNotFoundError = "challenge not found";
                    if (!challenge) {
                        throw challegeNotFoundError;
                    }
                    await ms.run(req.user.team, async() => {
                        const team = await Team.findOneSerialized({
                            competition: req.competition,
                            id: req.user.team,
                        });
                        if (
                            team.solves
                                .map((solve) => solve.challenge.id)
                                .indexOf(challenge.id) === -1
                        ) {
                            const submission = new Submission({
                                team: team.id,
                                user: req.user.id,
                                challenge: challenge.id,
                                content: req.body.flag,
                                competition: req.competition,
                            });
                            await submission.save();
                            await ctf.emitAfter("submitFlag", req, {
                                challenge: challenge,
                                team: team,
                                submission: submission,
                            });
                            res.json({
                                correct: submission.content === challenge.flag,
                            });
                        } else {
                            res.status(400).json({
                                message: "challenge_already_solved",
                            });
                        }
                    });
                } catch (err) {
                    res.status(404).json({message: "challenge_not_found"});
                }
            } else {
                res.status(403).json({message: "user_not_on_team"});
            }
        }
    );

    // modify a challenge
    router.patch(
        "/:id",
        [
            body("title").isString().isLength({min: 1}).optional(),
            body("description").isString().isLength({min: 1}).optional(),
            body("value").isNumeric().optional(),
            body("author").isString().isLength({min: 1}).optional(),
            body("flag").isString().isLength({min: 1}).optional(),
            body("category").isString().isLength({min: 1}).optional(),
            body("hint").isString().isLength({min: 1}).optional(),
            body("enabled").isBoolean().optional(),
        ],
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            if (req.user.admin) {
                await ctf.emitBefore("modifyChallenge", req);
                let challenge = await Challenge.findOne({
                    competition: req.competition,
                    id: req.params.id,
                });
                if (!challenge) {
                    return res
                        .status(404)
                        .json({message: "challenge_not_found"});
                }

                let errors = validationResult(req);
                errors = errors.array().map((e) => e.param);
                if (errors.length > 0) {
                    return res.status(400).json({message: "invalid_values"});
                }

                if (req.body.title && errors.indexOf("title") === -1) {
                    challenge.title = req.body.title;
                }
                if (
                    req.body.description &&
                    errors.indexOf("description") === -1
                ) {
                    challenge.description = req.body.description;
                }
                if (req.body.value && errors.indexOf("value") === -1) {
                    challenge.value = req.body.value;
                }
                if (req.body.author && errors.indexOf("author") === -1) {
                    challenge.author = req.body.author;
                }
                if (req.body.flag && errors.indexOf("flag") === -1) {
                    challenge.flag = req.body.flag;
                }
                if (req.body.category && errors.indexOf("category") === -1) {
                    challenge.category = req.body.category;
                }
                if (req.body.hint && errors.indexOf("hint") === -1) {
                    challenge.hint = req.body.hint;
                }
                if (
                    req.body.enabled !== undefined &&
                    errors.indexOf("enabled") === -1
                ) {
                    challenge.enabled = req.body.enabled;
                }

                challenge = await challenge.save();
                await ctf.emitAfter("modifyChallenge", req, {
                    challenge: challenge,
                });

                res.sendStatus(204);
            } else {
                res.status(403).json({message: "action_forbidden"});
            }
        }
    );

    // delete a challenge
    router.delete(
        "/:id",
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            if (req.user.admin) {
                await ctf.emitBefore("deleteChallenge", req);
                await Challenge.delete({id: req.params.id});
                await ctf.emitAfter("deleteChallenge", req);
                res.sendStatus(204);
            } else {
                res.status(403).json({message: "action_forbidden"});
            }
        }
    );

    return router;
};
