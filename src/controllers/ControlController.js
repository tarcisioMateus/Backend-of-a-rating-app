const knex = require('../database/knex')

const appError = require('../utils/appError')
const asyncForEach = require('../utils/asyncForEach')

const updateAlbumAverageRating = require('./global_function/updateAlbumAverageRating')

class ControlController {
    async listActivityFromPreviousDays (request, response) {
        const { days } = request.body

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }
        
        const ratings = await knex('ratings').where({ is_flagged: null })

        const startingDate = getValidStartingDate (days)
        const recentActivity = ratings.filter( rt => activityAfterStartingDate (rt.updated_at, startingDate))
        
        const AlbumsUsersActivity = getAlbumAndUserActivity (recentActivity)
        
        return response.json(AlbumsUsersActivity)
    }

    async flagRatingsBelow (request, response) {
        const { album_id, singer, record_lable, threshold } = request.body
        const { admin_id } = request.params

        const history_id = await createHistoryOfFlaggedRatingsBelow (admin_id, threshold, album_id, singer, record_lable)

        await flagRatingsBelowAlbumId (album_id, threshold, history_id)
        await flagRatingsBelowSinger (singer, threshold, history_id)
        await flagRatingsBelowRecordLable (record_lable, threshold, history_id)

        return response.json()
    }

    async flagRatingsSince (request, response) {
        const { album_id, singer, record_lable, days } = request.body
        const { admin_id } = request.params

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }

        const history_id = await createHistoryOfFlaggedRatingsSince (admin_id, days, album_id, singer, record_lable)

        const startingDate = getValidStartingDate (days)

        await flagRatingsSinceAlbumId (album_id, startingDate, history_id)
        await flagRatingsSinceSinger (singer, startingDate, history_id)
        await flagRatingsSinceRecordLable (record_lable, startingDate, history_id)

        return response.json()
    }

    async flagUser (request, response) {
        const { user_id } = request.body
        const { admin_id } = request.params

        const history_id = await createHistoryOfDeletedUser ( user_id, admin_id )

        const albumsRatedByUser = (await knex('ratings').where({user_id})).map(rt => rt.album_id)

        await flagUserRatings (user_id, history_id)
        await knex('users').where({id: user_id}).update({ is_flagged: history_id})

        await asyncForEach(albumsRatedByUser, updateAlbumAverageRating)
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
        const ratings = await knex('ratings').where({album_id: album.id, is_flagged: null})
        singerRatings = [...singerRatings, ...ratings]
    }
    return singerRatings
}
async function getRecordLableRatings (record_lable) {
    const rlAlbums = await knex('albums').where({record_lable})
    let rlRatings = []
    
    for (let album of rlAlbums) {
        const ratings = await knex('ratings').where({album_id: album.id, is_flagged: null})
        rlRatings = [...rlRatings, ...ratings]
    }
    return rlRatings
}


async function flagRatingsBelowAlbumId (album_id, threshold, history_id) {
    if (album_id) {
        const albumsRatings = await knex ('ratings').where({album_id, is_flagged: null})
        for (let rt of albumsRatings) {
            if ( rt.stars <= threshold) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        await updateAlbumAverageRating(album_id)
    }
}
async function flagRatingsBelowSinger (singer, threshold, history_id) {
    if (singer) {
        const singerRatings = await getSingerRatings(singer)
        for (let rt of singerRatings) {
            if ( rt.stars <= threshold) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        const singerAlbums = (await knex('albums').where({singer})).map(album => album.id)
        await asyncForEach(singerAlbums, updateAlbumAverageRating)
    }
}
async function flagRatingsBelowRecordLable (record_lable, threshold, history_id) {
    if (record_lable) {
        const rlRatings = await getRecordLableRatings (record_lable)
        for (let rt of rlRatings) {
            if ( rt.stars <= threshold) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        const rlAlbums = (await knex('albums').where({record_lable})).map(album => album.id)
        await asyncForEach(rlAlbums, updateAlbumAverageRating)
    }
}



async function flagRatingsSinceAlbumId (album_id, startingDate, history_id) {
    if (album_id) {
        const albumsRatings = await knex ('ratings').where({album_id, is_flagged: null})
        for (let rt of albumsRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        await updateAlbumAverageRating(album_id)
    }
}
async function flagRatingsSinceSinger (singer, startingDate, history_id) {
    if (singer) {
        const singerRatings = await getSingerRatings(singer)
        for (let rt of singerRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        const singerAlbums = (await knex('albums').where({singer})).map(album => album.id)
        await asyncForEach(singerAlbums, updateAlbumAverageRating)
    }
}
async function flagRatingsSinceRecordLable (record_lable, startingDate, history_id) {
    if (record_lable) {
        const rlRatings = await getRecordLableRatings (record_lable)
        for (let rt of rlRatings) {
            if (activityAfterStartingDate (rt.updated_at, startingDate)) {
                await knex ('ratings').where({id: rt.id}).update({ is_flagged: history_id})
            }
        }
        const rlAlbums = (await knex('albums').where({record_lable})).map(album => album.id)
        await asyncForEach(rlAlbums, updateAlbumAverageRating)
    }
}



async function createHistoryOfFlaggedRatingsBelow (admin_id, threshold, album_id, singer, record_lable) {
    if (album_id) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsBelow: ${threshold}, fromAlbumId: ${album_id}`
        })
        return id
    }
    if (singer) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsBelow: ${threshold}, fromSinger: ${singer}`
        })
        return id
    }
    if (record_lable) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsBelow: ${threshold}, fromRecordLable: ${record_lable}`
        })
        return id
    }
}

async function createHistoryOfFlaggedRatingsSince (admin_id, days, album_id, singer, record_lable) {
    if (album_id) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsSince: ${days}, fromAlbumId: ${album_id}`
        })
        return id
    }
    if (singer) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsSince: ${days}, fromSinger: ${singer}`
        })
        return id
    }
    if (record_lable) {
        const [id] = await knex('history').insert({
            user_id: admin_id, type: `deleteRatingsSince: ${days}, fromRecordLable: ${record_lable}`
        })
        return id
    }
}


async function createHistoryOfFlaggedUser ( user_id, admin_id ) {
    const [id] = await knex('history').insert({ user_id: admin_id, type: `deleteUser: ${user_id}` })

    return id
}

async function flagUserRatings (user_id, history_id) {
    await knex('ratings').where({user_id}).update({is_flagged: history_id})
}