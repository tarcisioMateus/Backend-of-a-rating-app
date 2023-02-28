const { Router } = require('express')

const ControlController = require('../controllers/ControlController')
const controlController = new ControlController()

const controlRoutes = Router()

controlRoutes.use('/activityDay', controlController.listActivityFromPreviousDays)
controlRoutes.use('/deleteRtBelow/:admin_id', controlController.deleteRatingsBelow)
controlRoutes.use('/deleteRTSince/:admin_id', controlController.deleteRatingsSince)
controlRoutes.use('/deleteUser/:admin_id', controlController.deleteUser)

module.exports = controlRoutes