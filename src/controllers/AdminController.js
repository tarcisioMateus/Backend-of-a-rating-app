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
    if (!title) {
        throw new appError("You can NOT add an album without it's title!")
    }
    if (!singer) {
        throw new appError("You can NOT add an album without it's singer!")
    }
    if (!genre) {
        throw new appError("You can NOT add an album without it's genre!")
    }
    if (!record_lable) {
        throw new appError("You can NOT add an album without it's record lable!")
    }
    if (!release_year) {
        throw new appError("You can NOT add an album without it's release year!")
    }
}