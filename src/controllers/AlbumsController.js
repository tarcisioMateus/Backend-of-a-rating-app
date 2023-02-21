const knex = require('../database/knex')

const appError = require('../utils/appError')

class AlbumsController {
    async listAllTags (request, response) {
        const albums = await knex('albums')

        let singers = []
        let genres = []
        let record_lables = []
        let release_years = []
        for (let album of albums) {
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

        singers.sort()
        genres.sort()
        record_lables.sort()
        release_years.sort()

        return response.json({
            singers,
            genres,
            record_lables,
            release_years
        })
    }

    async show (request, response) {
        const { id } = request.params

        const album = await knex('albums').where({id}).first()

        return response.json(album)
    }
}

module.exports = AlbumsController