
exports.up = function(knex, Promise) {
  knex.schema.table('submissions', function (t) {
    t.foreign('competition').references('competitions.id').onDelete('CASCADE')
    t.foreign('team').references('teams.id').onDelete('CASCADE')
    t.foreign('challenge').references('challenges.id').onDelete('CASCADE')
    t.index('competition')
    t.index('team')
    t.index('challenge')
    t.index('user')
    t.index('content')
  })

  knex.schema.table('challenges', function (t) {
    t.foreign('competition').references('competitions.id').onDelete('CASCADE')
    t.index('flag')
    t.index('competition')
  })

  knex.schema.table('users', function (t) {
    t.foreign('competition').references('competitions.id').onDelete('CASCADE')
    t.index('competition')
    t.index('team')
  })

  return knex.schema.table('teams', function (t) {
    t.foreign('competition').references('competitions.id').onDelete('CASCADE')
    t.index('competition')
  })

};

exports.down = function(knex, Promise) {
  
  knex.schema.table('submissions', function (t) {
    t.dropForeign('competition')
    t.dropIndex('competition')
    t.dropForeign('team')
    t.dropIndex('team')
    t.dropForeign('challenge')
    t.dropIndex('challenge')
    t.dropForeign('user')
    t.dropIndex('user')
  })

  knex.schema.table('challenges', function (t) {
    t.dropForeign('competition')
    t.dropIndex('competition')
  })

  knex.schema.table('users', function (t) {
    t.dropForegin('competition')
    t.dropIndex('competition')
    t.dropForeign('team')
    t.dropIndex('team')
  })

  knex.schema.table('teams', function (t) {
    t.dropForeign('competition')
    t.dropIndex('competition')
  })

};
