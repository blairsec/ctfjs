exports.up = function (knex, Promise) {
    return knex.schema.table("challenges", function (t) {
        t.boolean("enabled").defaultTo(false);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.table("challenges", function (t) {
        t.dropColumn("enabled");
    });
};
