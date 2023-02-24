const knex = require('../database/knex')

const appError = require('../utils/appError')

class ControlController {
    async listActivityDays (request, response) {
        const { days } = request.body

        if (Number(days) > 365) {
            throw new appError("You can't look beyond the previous 365 days!")
        }
        const startingDate = getValidStartingDate (days)

        const ratings = await knex('ratings')
    
        

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