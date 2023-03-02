const knex = require('../database/knex')

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

    async index (request, response) {
        const { singer, genre, record_lable, release_year } = request.body
        
        let albums = await knex('albums')
        const average_ratings = await knex('average_ratings')

        if (singer) {
            albums = albums.filter(album => album.singer == singer)
        }
        if (genre) {
            albums = albums.filter(album => album.genre == genre)
        }
        if (record_lable) {
            albums = albums.filter(album => album.record_lable == record_lable)
        }
        if (release_year) {
            albums = albums.filter(album => album.release_year == release_year)
        }
        albums = indexWithAverageRatings (albums, average_ratings)

        return response.json(albums)
    }
}

module.exports = AlbumsController

function indexWithAverageRatings (albums, average_ratings) {
    const albumsWithAvRt = albums.map( album => {
        const albumRt = average_ratings.filter( rt => rt.album_id == album.id)
        return {
            album,
            average_rating: albumRt[0].rating,
            updated_at: albumRt[0].updated_at
        }
    })
    return albumsWithAvRt
}