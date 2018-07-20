
exports.up = function(knex) {

  return knex.schema.createTable('home', t => {
    t.increments('id').unsigned().primary()
    t.timestamp('created')
    t.timestamp('updated')
    t.text('title')
    t.text('content')
  })

}

exports.down = function(knex) {
  
  return knex.schema.dropTable('home')

}
