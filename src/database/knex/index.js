const config = require('../../../knexfile')
const knex = require('knex')

module.exportes = knex(config.development)