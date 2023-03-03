const knex = require('../database/knex')

const appError = require('../utils/appError')

class HistoryController {
    async index (request, response) {
        const { type, who } = request.body
        const { admin_id } = request.params

        let history

        if (type) {
            history = await knex('history').select([
                'id', 'user_id', 'type', 'date_time'
            ]).whereLike('type', `%${type}%`)
        } else {
            history = await knex('history').select([
                'id', 'user_id', 'type', 'date_time'
            ])
        }

        switch (who) {
            case 'mine':
                history = history.filter(h => h.user_id == admin_id)
                break;
            case 'others':
                history = history.filter(h => h.user_id != admin_id)
                break;
        }

        return response.json(history)
    }

    async show (request, response) {
        const { id } = request.params

        const history = await knex('history').where({id}).first()

        return response.json(history)
    }

    async undo (request, response) {
        const { id, admin_id } = request.params

        const history = await knex('history').where({id}).first()

        if (history.type.includes('Ratings')) {
            await reUploadDeletedRatings (JSON.parse(history.data))
        }
        if (history.type.includes('Users')) {
            await reUploadDeletedUserWithItsRatings (JSON.parse(history.data))
        }

    }

        
}

module.exports = HistoryController

async function reUploadDeletedRatings (data) {
    const users = await knex('users')
    const albums = await knex('albums')
    let cantUploadRatings = []
    
    data.forEach(rt => {
        if (users.filter(user => user.id == rt.user_id).length > 0){
            if(albums.filter(album => album.id == rt.album_id).length > 0){
                const {id, user_id, album_id, stars, review, created_at, updated_at} = rt
                
                await knex('ratings').insert({id, user_id, album_id, stars, review, created_at, updated_at})
                return
            }
        }
        cantUploadRatings = [...cantUploadRatings, rt]
    })
    return cantUploadRatings
}

async function reUploadDeletedUserWithItsRatings (data) {
    const {id, admin_key, name, email, password, avatar, created_at, updated_at} = data.user
    
    await knex('users').insert({id, admin_key, name, email, password, avatar, created_at, updated_at})
    
    const albums = await knex('albums')
    let cantUploadRatings = []
    
    data.userRatings.forEach(rt => {
        if(albums.filter(album => album.id == rt.album_id).length > 0){
            const {id, user_id, album_id, stars, review, created_at, updated_at} = rt
                
            await knex('ratings').insert({id, user_id, album_id, stars, review, created_at, updated_at})
            return
        }
        cantUploadRatings = [...cantUploadRatings, rt]
    })
    return cantUploadRatings
}