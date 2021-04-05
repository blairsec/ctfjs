exports.up = function (knex) {
    return knex.schema.alterTable("challenges", (t) => {
        t.timestamp("created").defaultTo(knex.fn.now()).alter();
        t.timestamp("updated").defaultTo(knex.fn.now()).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("challenges", (t) => {
        t.timestamp("created").alter();
        t.timestamp("updated").alter();
    });
};
