const knex = require('../database/knex')

const appError = require('../utils/appError')

class UsersController {
    async update (request, response) {
        const { name, email, currentPassword, newPassword } = request.body
        const { id } = request.params

        
    }
}

module.exports = UsersController