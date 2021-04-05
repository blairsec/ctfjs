exports.up = function (knex) {
    return knex.schema.createTable("shell", (t) => {
        t.increments("id").unsigned().primary();
        t.text("username");
        t.text("password");
        t.integer("team").unsigned();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("shell");
};
