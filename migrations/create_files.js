
exports.up = function (knex) {
  return knex.schema.createTable('files', t => {
    t.increments('id').unsigned().primary()
    t.text('path')
    t.integer('challenge').unsigned()
    t.foreign('challenge').references('challenges.id').onDelete('SET NULL')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('files')
}
