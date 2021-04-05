exports.up = function (knex) {
    return knex.raw("CREATE EXTENSION IF NOT EXISTS citext").then(function () {
        return knex.schema.createTable("teams", (t) => {
            t.increments("id").unsigned().primary();
            t.timestamp("created").defaultTo(knex.fn.now());
            t.timestamp("updated").defaultTo(knex.fn.now());
            t.specificType("name", "citext");
            t.text("affiliation");
            t.text("passcode");
            t.integer("competition").unsigned();
            t.unique(["name", "competition"]);
        });
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("teams");
};
