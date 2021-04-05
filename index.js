const CTF = require("./ctf");
const process = require("process");

const ctf = new CTF({
    db_uri: process.env.DATABASE_URI,
    jwt_secret: process.env.SECRET_KEY,
    cors_origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : process.env.CORS_ORIGIN,
    disable_cache: !!process.env.DISABLE_CACHE,
});

const express = require("express");
const app = express();
app.use(ctf.router);

if (process.env.PLUGIN_FOLDER) {
    const glob = require("glob");
    const path = require("path");

    glob.sync(process.env.PLUGIN_FOLDER + "/*/index.js").forEach(function (
        file
    ) {
        require(path.resolve(file))(ctf);
    });
}

app.listen(process.env.PORT);

module.exports = app;
