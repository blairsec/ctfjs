
exports.up = function (knex) {
  return knex.schema.createTable('files', t => {
    t.increments('id').unsigned().primary()
    t.text('source')
    t.text('destination')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('files')
}
