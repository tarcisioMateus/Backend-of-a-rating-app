const knex = require('../database/knex')

const appError = require('../utils/appError')

class AdminController {
    async addAlbum (request, response) {
        const { title, singer, genre, record_lable, release_year } = request.body

        addAlbumInputValidation ( title, singer, genre, record_lable, release_year )

        const album_id = await knex('albums').insert({ title, singer, genre, record_lable, release_year })

        await knex('average_ratings').insert({album_id, rating: ''})
        return response.json()
    }

    async deleteAlbum (request, response) {
        const { album_id } = request.params

        await knex('albums').where({id: album_id}).delete()

        return response.json()
    }
}

module.exports = AdminController

function addAlbumInputValidation ( title, singer, genre, record_lable, release_year ) {

    const input = [title, singer, genre, record_lable, release_year]
    const type = ['title', 'singer', 'genre', 'record_lable', 'release_year']

    for (let count = 0; count < 5; count++) {
        if (!input[count]) {
            throw new appError(`You can NOT add an album without it's ${type[count]}!`)
        }
    }
}