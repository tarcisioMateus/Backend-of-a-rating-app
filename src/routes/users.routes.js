const { Router } = require('express')

const UsersController = require('../controllers/UsersController')
const usersController = new UsersController()

const usersRoutes = Router()

usersRoutes.put('/:id', usersController.update)
usersRoutes.delete('/:id', usersController.delete)

module.exports = usersRoutes