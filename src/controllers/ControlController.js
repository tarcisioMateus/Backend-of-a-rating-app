const knex = require('../database/knex')

const appError = require('../utils/appError')

class ControlController {
    async listActivityDays (request, response) {
        const { days } = request.body

        const ratings = await knex('ratings')
        
        
    }
}

module.exports = ControlController