const knex = require('../database/knex')

const appError = require('../utils/appError')

const { hash, compare } = require('bcryptjs')

class UsersController {
    async update (request, response) {
        const { name, email, currentPassword, newPassword } = request.body
        const { id } = request.params

        const user = await knex('users').where({id}).first()

        if (await updateEmailCheck(email, user)) {
            user.email = email
        }

        if (await updatePasswordCheck(currentPassword, newPassword, user)) {
            user.password = await hash( newPassword, 8 )
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

async function updatePasswordCheck (currentPassword, newPassword, user) {
    if (newPassword) {

        if (!currentPassword) {
            throw new appError ("You must provide your current password if you want to change it!")
        }
        const passwordCheck = await compare(currentPassword, user.password)
        if (!passwordCheck) {
            throw new appError ("The password isn't right!")
        }
        return true
    }
    return false
}