const { Router } = require('express')

const RatingsController = require('../controllers/RatingsController')
const ratingsController = new RatingsController()

const ratingsRoutes = Router()

ratingsRoutes.post('/create/:album_id/:user_id', ratingsController.create)

module.exports = ratingsRoutes