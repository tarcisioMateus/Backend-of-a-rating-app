const { Router } = require('express')

const ControlController = require('../controllers/ControlController')
const controlController = new ControlController()

const controlRoutes = Router()

controlRoutes.use('/activityDay', controlController.listActivityDays)

module.exports = controlRoutes