const { Router } = require('express')

const ControlController = require('../controllers/ControlController')
const controlController = new ControlController()

const controlRoutes = Router()

controlRoutes.use('/activityDay', controlController.listActivityFromPreviousDays)
controlRoutes.use('/flagRtBelow/:admin_id', controlController.flagRatingsBelow)
controlRoutes.use('/flagRTSince/:admin_id', controlController.flagRatingsSince)
controlRoutes.use('/flagUser/:admin_id', controlController.flagUser)

module.exports = controlRoutes