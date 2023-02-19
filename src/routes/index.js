const { Router } = require('express')

const accountRoutes = require('./account.routes')

const routes = Router()

routes.use('account', accountRoutes)

module.exports = routes