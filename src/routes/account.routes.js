const { Router } = require('express')

const AccountController = require('../controllers/AccountController')
const accountController = new AccountController()

const accountRoutes = Router()

accountRoutes.post('/', accountController.signUp)
accountRoutes.get('/', accountController.login)

module.exports = accountRoutes