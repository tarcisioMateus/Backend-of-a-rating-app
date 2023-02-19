const { Router } = require('express')

const AccountController = require('../controllers/AccountController')
const accountController = new AccountController()

const accountRoutes = Router()

accountRoutes.post('/signup', accountController.signUp)
accountRoutes.get('/login', accountController.login)

module.exports = accountRoutes