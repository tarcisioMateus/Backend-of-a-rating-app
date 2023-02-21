const { Router } = require('express')

const RatingsController = require('../controllers/RatingsController')
const ratingsController = new RatingsController()

const ratingsRoutes = Router()

ratingsRoutes.post('/create/:album_id/:user_id', ratingsController.create)
ratingsRoutes.delete('/delete/:id', ratingsController.delete)
ratingsRoutes.put('/update/:id', ratingsController.update)

module.exports = ratingsRoutes