
exports.up = function (knex) {
  return knex.schema.createTable('password_reset', t => {
    t.increments('id').unsigned().primary()
    t.timestamp('created').defaultTo(knex.fn.now())
    t.timestamp('updated').defaultTo(knex.fn.now())
    t.text('token')
    t.boolean('used').defaultTo(false)
    t.timestamp('expiry')
    t.integer('user').unsigned()
    t.foreign('user').references('users.id').onDelete('SET NULL')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('password_reset')
}
