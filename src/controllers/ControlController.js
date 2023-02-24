const knex = require('../database/knex')

const appError = require('../utils/appError')

class ControlController {
    async listActivityDays (request, response) {
        const { days } = request.body

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }
        
        const ratings = await knex('ratings')

        const startingDate = getValidStartingDate (days)
        const recentActivity = ratings.filter( rt => activityAfterStartingDate (rt.updated_at, startingDate))
        
        let albumsActivity, usersActivity

        
        
    
        

        return response.json()
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
    
    for (let i in startingDate) {
        if ( activityYMD[i] < startingDate[i] ) {
            return false
        }
    }
    return true
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