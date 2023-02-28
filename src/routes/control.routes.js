const { Router } = require('express')

const ControlController = require('../controllers/ControlController')
const controlController = new ControlController()

const controlRoutes = Router()

controlRoutes.use('/activityDay', controlController.listActivityFromPreviousDays)
controlRoutes.use('/deleteRtBelow', controlController.deleteRatingsBelow)
controlRoutes.use('/deleteRTSince', controlController.deleteRatingsSince)
controlRoutes.use('/deleteUser', controlController.deleteUser)

module.exports = controlRoutes