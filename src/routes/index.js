const { Router } = require('express')

const accountRoutes = require('./account.routes')
const usersRoutes = require('./users.routes')

const routes = Router()

routes.use('/account', accountRoutes)
routes.use('/users', usersRoutes)

module.exports = routes