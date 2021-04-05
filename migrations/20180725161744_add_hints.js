exports.up = function (knex, Promise) {
    return knex.schema.table("challenges", function (t) {
        t.text("hint");
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("challenges", function (t) {
        t.dropColumn("hint");
    });
};
