const knex = require('../database/knex')

const appError = require('../utils/appError')

class RatingsController {
    async create (request, response) {
        const { album_id, user_id } = request.params
        const { stars, review } = request.body

        createInputValidation (stars, review)
        await createOneRatingPerUser (album_id, user_id)

        await knex('ratings').insert({ album_id, user_id, stars: Number(stars).toFixed(1), review })

        return response.status(201).json()
    }

    async delete (request, response) {
        const { id } = request.params

        await knex('ratings').where({id}).delete()

        return response.json()
    }

    async update (request, response) {
        const { id } = request.params
        const { stars, review } = request.body

        const rating = await knex('ratings').where({id}).first()

        if (stars) {
            if (stars < 0 || stars > 5) {
                throw new appError('the amount of stars you can give in is between 0 and 5 only!')
            }
            rating.stars = Number(stars).toFixed('1')
        }
        rating.review = review ? review : rating.review

        await knex('ratings').where({id}).update({ stars: rating.stars, review: rating.review, updated_at: knex.fn.now()})

        return response.json()
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

async function createOneRatingPerUser (album_id, user_id) {
    const userRatedAlbum = await knex('ratings').where({user_id, album_id}).first()

    if (userRatedAlbum.length == 0) {
        return
    }
    throw new appError("You've already rated this album!")
}