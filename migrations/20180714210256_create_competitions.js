exports.up = function (knex) {
    return knex.schema.createTable("competitions", (t) => {
        t.increments("id").unsigned().primary();
        t.timestamp("created");
        t.timestamp("updated");
        t.text("name");
        t.text("about");
        t.timestamp("start");
        t.timestamp("end");
        t.integer("teamSize").unsigned();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("competitions");
};
