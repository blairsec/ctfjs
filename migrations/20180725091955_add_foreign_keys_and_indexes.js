
exports.up = function(knex, Promise) {

  return knex.schema.table('teams', function (t) {
    t.foreign('competition').references('competitions.id').onDelete('SET NULL')
    t.index('competition')
  }).then(function () {
    return knex.schema.table('users', function (t) {
      t.foreign('competition').references('competitions.id').onDelete('SET NULL')
      t.foreign('team').references('teams.id').onDelete('SET NULL')
      t.index('competition')
      t.index('team')
    })
  }).then(function () {
    return knex.schema.table('challenges', function (t) {
      t.foreign('competition').references('competitions.id').onDelete('SET NULL')
      t.index('flag')
      t.index('competition')
    })
  }).then(function () {
    return knex.schema.table('submissions', function (t) {
      t.foreign('competition').references('competitions.id').onDelete('SET NULL')
      t.foreign('team').references('teams.id').onDelete('SET NULL')
      t.foreign('challenge').references('challenges.id').onDelete('SET NULL')
      t.foreign('user').references('users.id').onDelete('SET NULL')
      t.index('competition')
      t.index('team')
      t.index('challenge')
      t.index('user')
      t.index('content')
    })
  })

};

exports.down = function(knex, Promise) {
  
  return knex.schema.table('submissions', function (t) {
    t.dropForeign('competition')
    t.dropIndex('competition')
    t.dropForeign('team')
    t.dropIndex('team')
    t.dropForeign('challenge')
    t.dropIndex('challenge')
    t.dropForeign('user')
    t.dropIndex('user')
  }).then(function () {
    return knex.schema.table('challenges', function (t) {
      t.dropForeign('competition')
      t.dropIndex('competition')
    })
  }).then(function () {
    return knex.schema.table('users', function (t) {
      t.dropForegin('competition')
      t.dropIndex('competition')
      t.dropForeign('team')
      t.dropIndex('team')
    })
  }).then(function () {
    return knex.schema.table('teams', function (t) {
      t.dropForeign('competition')
      t.dropIndex('competition')
    })
  })
};
