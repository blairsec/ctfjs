
exports.up = function(knex, Promise) {
  
  return knex.schema.table('users', function (t) {

  	t.integer('iterations').defaultTo(100000)

  })

};

exports.down = function(knex, Promise) {
  
  return knex.schema.table('users', function (t) {

  	t.dropColumn('iterations')

  })

};
