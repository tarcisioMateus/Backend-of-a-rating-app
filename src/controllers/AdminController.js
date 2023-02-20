const knex = require('../database/knex')

const appError = require('../utils/appError')

class AdminController {
    async addAlbum (request, response) {
        const { title, singer, genre, record_lable, release_year } = request.body
    }
}

module.exports = AdminController