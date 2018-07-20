class db {
  
  constructor () {
    this.db = null
  }

  async init (uri) {
    this.db = require('knex')({
      client: 'pg',
      connection: uri,
      migrations: {
        directory: __dirname+'/migrations'
      }
    })
    await this.db.migrate.latest()
  }

}

module.exports = new db()