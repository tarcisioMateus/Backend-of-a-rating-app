const knex = require('../database/knex')

const appError = require('../utils/appError')

const updateAlbumAverageRating = require('./global_function/updateAlbumAverageRating')

class ControlController {
    async listActivityFromPreviousDays (request, response) {
        const { days } = request.body

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }
        
        const ratings = await knex('ratings')

        const startingDate = getValidStartingDate (days)
        const recentActivity = ratings.filter( rt => activityAfterStartingDate (rt.updated_at, startingDate))
        
        const AlbumsUsersActivity = getAlbumAndUserActivity (recentActivity)
        
        return response.json(AlbumsUsersActivity)
    }

    async deleteRatingsBelow (request, response) {
        const { album_id, singer, record_lable, threshold } = request.body
        const { admin_id } = request.params

        const deletedDataAI = await deleteRatingsBelowAlbumId (album_id, threshold)
        const deletedDataS = await deleteRatingsBelowSinger (singer, threshold)
        const deletedDataRL = await deleteRatingsBelowRecordLable (record_lable, threshold)

        const deletedData = { "AI": deletedDataAI, "S": deletedDataS, "RL": deletedDataRL }
        const filter = { album_id, singer, record_lable }
        await createHistoryOfDeletedRatingsBelow (admin_id, threshold, filter, deletedData)

        return response.json()
    }

    async deleteRatingsSince (request, response) {
        const { album_id, singer, record_lable, days } = request.body
        const { admin_id } = request.params

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }

        const startingDate = getValidStartingDate (days)

        const deletedDataAI = await deleteRatingsSinceAlbumId (album_id, startingDate)
        const deletedDataS = await deleteRatingsSinceSinger (singer, startingDate)
        const deletedDataRL = await deleteRatingsSinceRecordLable (record_lable, startingDate)

        const deletedData = { "AI": deletedDataAI, "S": deletedDataS, "RL": deletedDataRL }
        const filter = { album_id, singer, record_lable }
        await createHistoryOfDeletedRatingsSince (admin_id, days, filter, deletedData)

        return response.json()
    }

    async deleteUser (request, response) {
        const { user_id } = request.body
        const { admin_id } = request.params

        const albumsRatedByUser = await createHistoryOfDeletedUser ( user_id, admin_id )
        await knex('users').where({id: user_id}).delete()

        albumsRatedByUser.forEach(album_id => await updateAlbumAverageRating (album_id))
        return response.json()
    }
}

module.exports = ControlController

function getValidStartingDate (days) {
    // To make life easier let's pretend every month has 30 days
    const today = ( new Date().toISOString().split('T') )[0]
    const YMD = (today.split('-')).map(tx => Number(tx))

    let monthsPrior = Math.floor(days/30)
    const daysPrior = days % 30
    
    let startingDay, startingMonth, startingYear

    if ( (YMD[2] - daysPrior) <= 0 ){
        startingDay = 30 + (YMD[2] - daysPrior)
        ++monthsPrior
    } else {
        startingDay = YMD[2] - daysPrior
    }
    if ( (YMD[1] - monthsPrior) <= 0 ){
        startingMonth = 12 + (YMD[1] - monthsPrior)
        startingYear = YMD[0] - 1
    } else {
        startingMonth = YMD[1] - monthsPrior
        startingYear = YMD[0]
    }

    return [ startingYear, startingMonth, startingDay ]
}

function activityAfterStartingDate (activityDate, startingDate) {
    const activityYMD = ( activityDate.split(' ')[0].split('-') ).map(tx => Number(tx))
    
    for (let i = 0; i < 3; i++) {
        if ( activityYMD[i] < startingDate[i] ) {
            return false
        }
        if ( activityYMD[i] > startingDate[i] ) {
            return true
        }
    }
    return true
}

function getAlbumAndUserActivity (recentActivity) {
    let albumsActivity = []
    let usersActivity = []

    for (let rt of recentActivity) {
        if (isTrackingActivityOfAlbum(albumsActivity, rt.album_id)) {
            for (let i in albumsActivity) {
                if (albumsActivity[i].album_id == rt.album_id) {
                    albumsActivity[i].activity = albumsActivity[i].activity + 1
                }
            }
        } else {
            albumsActivity = [...albumsActivity, {
                album_id: rt.album_id,
                activity: 1
            }]
        }
        
        if (isTrackingActivityOfUser(usersActivity, rt.user_id)) {
            for (let i in usersActivity) {
                if (usersActivity[i].user_id == rt.user_id) {
                    usersActivity[i].activity = usersActivity[i].activity + 1
                }
            }
        } else {
            usersActivity = [...usersActivity, {
                user_id: rt.user_id,
                activity: 1
            }]
        }
    }
    return [{albumsActivity}, {usersActivity}]
}

function isTrackingActivityOfAlbum (albumsActivity, album_id) {
    for (let activity of albumsActivity) {
        if (activity.album_id == album_id){
            return true
        }
    }
    return false
}

function isTrackingActivityOfUser (usersActivity, user_id) {
    for (let activity of usersActivity) {
        if (activity.user_id == user_id){
            return true
        }
    }
    return false
}



async function getSingerRatings (singer) {
    const singerAlbums = await knex('albums').where({singer})
    let singerRatings = []
    
    for (let album of singerAlbums) {
        const ratings = await knex('ratings').where({album_id: album.id})
        singerRatings = [...singerRatings, ...ratings]
    }
    return singerRatings
}
async function getRecordLableRatings (record_lable) {
    const rlAlbums = await knex('albums').where({record_lable})
    let rlRatings = []
    
    for (let album of rlAlbums) {
        const ratings = await knex('ratings').where({album_id: album.id})
        rlRatings = [...rlRatings, ...ratings]
    }
    return rlRatings
}


async function deleteRatingsBelowAlbumId (album_id, threshold) {
    let deletedData = []
    if (album_id) {
        const albumsRatings = await knex ('ratings').where({album_id})
        for (let rt of albumsRatings) {
            if ( rt.stars <= threshold) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        await updateAlbumAverageRating(album_id)
        return deletedData
    }
}
async function deleteRatingsBelowSinger (singer, threshold) {
    let deletedData = []
    if (singer) {
        const singerRatings = await getSingerRatings(singer)
        for (let rt of singerRatings) {
            if ( rt.stars <= threshold) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        const singerAlbums = await knex('albums').where({singer})
        singerAlbums.forEach(album => await updateAlbumAverageRating (album.id))
        return deletedData
    }
}
async function deleteRatingsBelowRecordLable (record_lable, threshold) {
    let deletedData = []
    if (record_lable) {
        const rlRatings = await getRecordLableRatings (record_lable)
        for (let rt of rlRatings) {
            if ( rt.stars <= threshold) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        const rlAlbums = await knex('albums').where({record_lable})
        rlAlbums.forEach(album => await updateAlbumAverageRating (album.id))
        return deletedData
    }
}



async function deleteRatingsSinceAlbumId (album_id, startingDate) {
    let deletedData = []
    if (album_id) {
        const albumsRatings = await knex ('ratings').where({album_id})
        for (let rt of albumsRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        await updateAlbumAverageRating(album_id)
        return deletedData
    }
}
async function deleteRatingsSinceSinger (singer, startingDate) {
    let deletedData = []
    if (singer) {
        const singerRatings = await getSingerRatings(singer)
        for (let rt of singerRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        const singerAlbums = await knex('albums').where({singer})
        singerAlbums.forEach(album => await updateAlbumAverageRating (album.id))
        return deletedData
    }
}
async function deleteRatingsSinceRecordLable (record_lable, startingDate) {
    let deletedData = []
    if (record_lable) {
        const rlRatings = await getRecordLableRatings (record_lable)
        for (let rt of rlRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                deletedData = [...deletedData, rt]
                await knex ('ratings').where({id: rt.id}).delete()
            }
        }
        const rlAlbums = await knex('albums').where({record_lable})
        rlAlbums.forEach(album => await updateAlbumAverageRating (album.id))
        return deletedData
    }
}



async function createHistoryOfDeletedRatingsBelow (admin_id, threshold, filter, deletedData) {
    if (deletedData.AI) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.AI), type: `deleteRatingsBelow: ${threshold}, fromAlbumId: ${filter.album_id}`
        })
    }
    if (deletedData.S) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.S), type: `deleteRatingsBelow: ${threshold}, fromSinger: ${filter.singer}`
        })
    }
    if (deletedData.RL) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.RL), type: `deleteRatingsBelow: ${threshold}, fromRecordLable: ${filter.record_lable}`
        })
    }
}

async function createHistoryOfDeletedRatingsSince (admin_id, days, filter, deletedData) {
    if (deletedData.AI) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.AI), type: `deleteRatingsSince: ${days}, fromAlbumId: ${filter.album_id}`
        })
    }
    if (deletedData.S) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.S), type: `deleteRatingsSince: ${days}, fromSinger: ${filter.singer}`
        })
    }
    if (deletedData.RL) {
        await knex('history').insert({
            user_id: admin_id, data: JSON.stringify(deletedData.RL), type: `deleteRatingsSince: ${days}, fromRecordLable: ${filter.record_lable}`
        })
    }
}


async function createHistoryOfDeletedUser ( user_id, admin_id ) {
    const user = await knex('users').where({id: user_id}).first()

    const userRatings = await knex('ratings').where({user_id})

    const data = JSON.stringify({user, userRatings})
    await knex('history').insert({ user_id: admin_id, data, type: `deleteUser: ${user_id}` })

    const albumsRatedByUser = userRatings.map(rt => rt.album_id)
    return albumsRatedByUser
}