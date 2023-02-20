const knex = require('../database/knex')

const appError = require('../utils/appError')

class AdminController {
    async addAlbum (request, response) {
        const { title, singer, genre, record_lable, release_year } = request.body

        addAlbumInputValidation ( title, singer, genre, record_lable, release_year )
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