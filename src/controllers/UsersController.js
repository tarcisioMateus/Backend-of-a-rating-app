const knex = require('../database/knex')

const appError = require('../utils/appError')

class UsersController {
    async update (request, response) {
        const { name, email, currentPassword, newPassword } = request.body
        const { id } = request.params

        const user = await knex('users').where({id}).first()

        if (await updateEmailCheck(email, user)) {
            user.email = email
        }
    }
}

module.exports = UsersController

async function updateEmailCheck (email, user) {
    if (email) {

        const userWithEmail = await knex('users').where({email}).first() 

        if (userWithEmail && userWithEmail.id !== user.id) {
            throw new appError (" This email is not available!")
        }
        return true
    }
    return false
}