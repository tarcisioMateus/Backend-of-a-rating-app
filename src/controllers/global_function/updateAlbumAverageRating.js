const knex = require('../../database/knex')

async function updateAlbumAverageRating (album_id) {
    const albumRatings = (await knex('ratings').where({album_id})).map(rating => Number(rating.stars))

    let averageRating = ''
    if (albumRatings.length > 0) {
        averageRating = (albumRatings.reduce((a, b) => a + b)/ albumRatings.length).toFixed(1)
    }

    await knex('average_ratings').where({album_id}).update({album_id, rating: averageRating, updated_at: knex.fn.now()})
}

module.exports = updateAlbumAverageRating