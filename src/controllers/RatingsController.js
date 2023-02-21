const knex = require('../database/knex')

const appError = require('../utils/appError')

class RatingsController {
    async create (request, response) {
        const { album_id, user_id } = request.params
        const { stars, review } = request.body

        createInputValidation (stars, review)

        await knex('ratings').insert({ album_id, user_id, stars: Number(stars).toFixed(1), review })

        return response.status(201).json()
    }
}

module.exports = RatingsController

function createInputValidation (stars, review) {

    if (!stars) {
        throw new appError('please, tell us how many stars would you give this album?')
    }
    if (stars < 0 || stars > 5) {
        throw new appError('the amount of stars you can give in is between 0 and 5 only!')
    }
    if (!review) {
        throw new appError('please, tell us what did you think of this album!')
    }
}