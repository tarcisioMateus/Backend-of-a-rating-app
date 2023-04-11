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
        
        if (history.type.includes('blocked')) {
            return response.json({
                ...history,
                users: (await knex('users').where({is_flagged: history.id}))
            })
        }

        let ratings, user
        if (history.type.includes('User')) user = await knex('users').where({is_flagged: id}).first()
            
        ratings = await knex('ratings').where({is_flagged: id})

        if (user) {
            return response.json({
                ...history,
                user,
                ratings
            })
        }
        return response.json({
            ...history,
            ratings
        })
    }

    async undo (request, response) {
        const { admin_id, id } = request.params

        const history = await knex('history').where({id}).first()

        if (history.undo_id) {
            throw new appError(`This data have been already reUploaded!`)
        }

        if (history.type.includes('Ratings')) {
            await unflagRatings (id)
        }
        if (history.type.includes('User')) {
            await knex('Users').where({ is_flagged: id}).update({ is_flagged: null})
            await unflagRatings (id)
        }
        if (history.type.includes('History')) {
            throw new appError(`You can NOT reUpload a History file!`)
        }

        const undo_id = await knex('history').insert({ user_id: admin_id, type: `reUploadHistory: ${id}` })
        await knex('history').where({id}).update({ undo_id })

        return response.json()
    }
    
    async delete (request, response) {
        const { admin_id } = request.params

        const deleteHistoryRequest = await knex('history').where({user_id: admin_id}).where({type: 'deleteHistory'}).first()

        if (!deleteHistoryRequest) {
            await knex('history').insert({ user_id: admin_id, type: 'deleteHistory' })
        }

        const allAdmin = await knex('users').where({admin_key: 'admin_key123'})
        const allDeleteHistoryRequest = await knex('history').where({type: 'deleteHistory'})

        if (allAdmin.length == allDeleteHistoryRequest.length) {
            const historys = await knex('history')
            
            let blockedUsers = []
            for (let h of historys){
                await knex('ratings').where({is_flagged: h.id}).delete()
                if (h.type.includes('blocked')) {
                    blockedUsers = [...blockedUsers, ...( ( await knex('users').where({is_flagged: h.id}) ).map( user => user.id ) )]
                } else if (h.type.includes('User')) {
                    const user = await knex('users').where({is_flagged: h.id}).first()
                    if ( user ) blockedUsers = [...blockedUsers, user.id]
                }
            }
            await knex('history').delete()
            await createHistory4BlockedUsers (blockedUsers, admin_id)
        }
        return response.json()
    }
}

module.exports = HistoryController

async function getChangedAlbums (id) {
    const ratings = await knex('ratings').where({is_flagged: id})
    let albums = []
    for (let rt of ratings) {
        if (!albums.includes(rt.album_id)) {
            albums = [...albums, rt.album_id]
        }
    }
    return albums
}

async function unflagRatings (id) {
    const changedAlbums = await getChangedAlbums (id)
    await knex('ratings').where({ is_flagged: id}).update({ is_flagged: null})

    await asyncForEach(changedAlbums, updateAlbumAverageRating)
}

async function createHistory4BlockedUsers (usersId, admin_id) {
    const [id] = await knex('history').insert({ user_id: admin_id, type: `blockedHistory: ---` })

    for (let user_id of usersId){
        await knex('users').where({ id: user_id }).update({is_flagged: id})
    }
}