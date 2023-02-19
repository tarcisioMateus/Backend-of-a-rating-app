const knex = require('../database/knex')

const appError = require('../utils/appError')

const { hash } = require('bcryptjs')

class accountController {
    async signIn ( request, response ) {
        const { name, email, password, admin_key } = request.body

        if (admin_key && admin_key !== 'admin_key123') {
            throw new appError(`You don't have permission to create an admin account.`)
        }

        const userWithEmail = await knex('users').where({email}).first()
        if (userWithEmail) {
            throw new appError(`This email: ${email}, it's already in use.`)
        }

        const cryptedPassword = await hash( password, 8 )

        await knex('users').insert({ name, email, password: cryptedPassword, admin_key })

        return response.status(201).json()
    }
}

module.exports = accountController