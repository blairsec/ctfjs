exports.up = function (knex, Promise) {
    return knex.schema
        .table("users", function (t) {
            t.dropUnique(["username", "competition"]);
            t.dropUnique(["email", "competition"]);
        })
        .then(function () {
            return knex.schema.raw(
                "create unique index username_competition_unique on users (username, competition) where competition is not null;"
            );
        })
        .then(function () {
            return knex.schema.raw(
                "create unique index email_competition_unique on users (email, competition) where competition is not null;"
            );
        })
        .then(function () {
            return knex.schema.raw(
                "create unique index username_unique on users (username) where competition is null;"
            );
        })
        .then(function () {
            return knex.schema.raw(
                "create unique index email_unique on users (email) where competition is null;"
            );
        });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("users", function (t) {
        t.dropUnique("username", "username_unique");
        t.dropUnique("email", "email_unique");
        t.dropUnique(
            ["username", "competition"],
            "username_competition_unique"
        );
        t.dropUnique(["email", "competition"], "email_competition_unique");
        t.unique(["username", "competition"]);
        t.unique(["email", "competition"]);
    });
};
