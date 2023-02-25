const knex = require('../database/knex')

const appError = require('../utils/appError')

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
}

module.exports = ControlController

function getValidStartingDate (days) {
    // To make life easier let's pretend every month has 30 days
    const today = ( new Date().toISOString().split('T') )[0]
    const YMD = (today.split('-')).map(tx => Number(tx))

    const monthsPrior = Math.floor(days/30)
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