const knex = require('../database/knex')

const appError = require('../utils/appError')

class AlbumsController {
    async listAllTags (request, response) {
        const albums = await knex('albums')

        const singers = []
        const genres = []
        const record_lables = []
        const release_years = []
        for (const album of albums) {
            if (!singers.includes(album.singer)) {
                singers = [ ...singers, album.singer]
            }
            if (!genres.includes(album.genre)) {
                genres = [ ...genres, album.genre]
            }
            if (!record_lables.includes(album.record_lable)) {
                record_lables = [ ...record_lables, album.record_lable]
            }
            if (!release_years.includes(album.release_year)) {
                release_years = [ ...release_years, album.release_year]
            }
        }

        return response.json({
            singers,
            genres,
            record_lables,
            release_years
        })
    }
}

module.exports = AlbumsController