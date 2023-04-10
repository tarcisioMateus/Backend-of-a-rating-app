const knex = require('../database/knex')

const appError = require('../utils/appError')

const { hash, compare } = require('bcryptjs')

class AccountController {
    async signUp ( request, response ) {
        const { name, email, password, admin_key } = request.body

        if (!password) {
            throw new appError("You must choose a password!")
        }
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

    async login ( request, response ) {
        const { email, password } = request.body

        const user = await knex('users').where({email}).first()
        if (!user) {
            throw new appError("There is no account attached to this email, please Sing Up 1st!")
        }

        const passwordCheck = await compare(password, user.password)
        if (!passwordCheck) {
            throw new appError("The email and password don't match!")
        }

        if (user.is_flagged) {
            throw new appError("Your account has been suspended!")
        }

        return response.json(user)
    }
}

module.exports = AccountController