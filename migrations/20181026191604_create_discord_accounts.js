exports.up = function (knex) {
    return knex.schema.createTable("discord_accounts", (t) => {
        t.increments("id").unsigned().primary();
        t.integer("user").unsigned();
        t.text("discord_id");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("discord_accounts");
};
