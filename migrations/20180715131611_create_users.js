exports.up = function (knex) {
    return knex.schema.createTable("users", (t) => {
        t.increments("id").unsigned().primary();
        t.timestamp("created").defaultTo(knex.fn.now());
        t.timestamp("updated").defaultTo(knex.fn.now());
        t.specificType("username", "citext");
        t.specificType("email", "citext");
        t.text("hash");
        t.text("salt");
        t.boolean("eligible");
        t.boolean("admin");
        t.integer("team").unsigned();
        t.integer("competition").unsigned();
        t.unique(["username", "competition"]);
        t.unique(["email", "competition"]);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("users");
};
