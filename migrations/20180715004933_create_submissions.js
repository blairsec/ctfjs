exports.up = function (knex) {
    return knex.schema.createTable("submissions", (t) => {
        t.increments("id").unsigned().primary();
        t.timestamp("created").defaultTo(knex.fn.now());
        t.timestamp("updated").defaultTo(knex.fn.now());
        t.text("content");
        t.integer("user").unsigned();
        t.integer("team").unsigned();
        t.integer("challenge").unsigned();
        t.integer("competition").unsigned();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("submissions");
};
