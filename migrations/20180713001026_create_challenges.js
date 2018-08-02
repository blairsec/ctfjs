
exports.up = function (knex) {
  return knex.schema.createTable('challenges', t => {
    t.increments('id').unsigned().primary()
    t.timestamp('created')
    t.timestamp('updated')
    t.text('title')
    t.text('description')
    t.text('flag')
    t.text('author')
    t.text('category')
    t.integer('value')
    t.integer('competition').unsigned()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('challenges')
}
