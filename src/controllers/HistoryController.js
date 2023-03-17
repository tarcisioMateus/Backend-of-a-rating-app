const knex = require('../database/knex')

const appError = require('../utils/appError')
const asyncForEach = require('../utils/asyncForEach')

const updateAlbumAverageRating = require('./global_function/updateAlbumAverageRating')

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
        const { admin_id, id } = request.params

        const history = await knex('history').where({id}).first()
        let cantUploadRatings

        if (history.undo_id) {
            throw new appError(`This data have been already reUploaded!`)
        }

        if (history.type.includes('Ratings')) {
            cantUploadRatings = await reUploadDeletedRatings (JSON.parse(history.data))
        }
        if (history.type.includes('User')) {
            cantUploadRatings = await reUploadDeletedUserWithItsRatings (JSON.parse(history.data))
        }
        if (history.type.includes('History')) {
            throw new appError(`You can NOT reUpload a History file!`)
        }

        const undo_id = await knex('history').insert({ user_id: admin_id, data: '', type: `reUploadHistory: ${id}` })
        await knex('history').where({id}).update({ undo_id })

        return response.json(cantUploadRatings)
    }
    
    async delete (request, response) {
        const { admin_id } = request.params

        const deleteHistoryRequest = await knex('history').where({user_id: admin_id}).where({type: 'deleteHistory'}).first()

        if (!deleteHistoryRequest) {
            await knex('history').insert({ user_id: admin_id, data: '', type: 'deleteHistory' })
        }

        const allAdmin = await knex('users').where({admin_key: 'admin_key123'})
        const allDeleteHistoryRequest = await knex('history').where({type: 'deleteHistory'})

        if (allAdmin.length == allDeleteHistoryRequest.length) {
            await knex('history').delete()
        }
        return response.json()
    }
}

module.exports = HistoryController

async function reUploadDeletedRatings (data) {
    const users = await knex('users')
    const albums = await knex('albums')
    let updatedAlbums = []
    let cantUploadRatings = []
    
    for (let rt of data){
        if (users.filter(user => user.id == rt.user_id).length > 0){
            if(albums.filter(album => album.id == rt.album_id).length > 0){
                const {user_id, album_id, stars, review, created_at, updated_at} = rt
                
                await knex('ratings').insert({user_id, album_id, stars, review, created_at, updated_at})

                if (!updatedAlbums.includes(album_id)) {
                    updatedAlbums = [...updatedAlbums, album_id]
                }
                continue
            }
        }
        cantUploadRatings = [...cantUploadRatings, rt]
    }
    await asyncForEach(updatedAlbums, updateAlbumAverageRating)
    return cantUploadRatings
}

async function reUploadDeletedUserWithItsRatings (data) {
    const {admin_key, name, email, password, avatar, created_at, updated_at} = data.user
    
    const user_id = await knex('users').insert({admin_key, name, email, password, avatar, created_at, updated_at})
    
    const albums = await knex('albums')
    let updatedAlbums = []
    let cantUploadRatings = []
    
    for (let rt of data.userRatings){
        if(albums.filter(album => album.id == rt.album_id).length > 0){
            const {album_id, stars, review, created_at, updated_at} = rt
                
            await knex('ratings').insert({user_id, album_id, stars, review, created_at, updated_at})

            if (!updatedAlbums.includes(album_id)) {
                updatedAlbums = [...updatedAlbums, album_id]
            }
            continue
        }
        cantUploadRatings = [...cantUploadRatings, rt]
    }
    await asyncForEach(updatedAlbums, updateAlbumAverageRating)
    return cantUploadRatings
}