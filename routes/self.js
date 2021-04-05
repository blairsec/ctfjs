module.exports = function (ctf) {
    const express = require("express");
    const passport = require("passport");
    const router = express.Router();

    const Competition = require("../models/competition");
    const User = require("../models/user");

    // get current authentication state
    router.get(
        "/",
        passport.authenticate("jwt", {session: false}),
        async (req, res) => {
            await ctf.emitBefore("getSelf", req);
            const competition = req.user.competition
                ? await Competition.findOneSerialized({
                      id: req.user.competition,
                  })
                : false;
            const user = await User.findOneSerialized(
                {id: req.user.id},
                {team: true, email: true}
            );
            await ctf.emitAfter("getSelf", req, {
                user: user,
                competition: competition,
            });
            res.json({user: user, competition: competition});
        }
    );

    return router;
};
