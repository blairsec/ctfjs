exports.up = function (knex) {
    return knex.schema.createTable("instances", (t) => {
        t.increments("id").unsigned().primary();
        t.timestamp("created").defaultTo(knex.fn.now());
        t.timestamp("updated").defaultTo(knex.fn.now());
        t.text("repo");
        t.text("tag");
        t.text("domain");
        t.text("container");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("instances");
};
