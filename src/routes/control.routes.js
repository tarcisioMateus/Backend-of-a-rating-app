const { Router } = require('express')

const ControlController = require('../controllers/ControlController')
const controlController = new ControlController()

const controlRoutes = Router()

controlRoutes.get('/activityDay', controlController.listActivityFromPreviousDays)
controlRoutes.put('/flagRtBelow/:admin_id', controlController.flagRatingsBelow)
controlRoutes.put('/flagRTSince/:admin_id', controlController.flagRatingsSince)
controlRoutes.put('/flagUser/:admin_id', controlController.flagUser)

module.exports = controlRoutes