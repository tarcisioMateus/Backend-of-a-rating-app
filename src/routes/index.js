const { Router } = require('express')

const accountRoutes = require('./account.routes')
const usersRoutes = require('./users.routes')
const adminRoutes = require('./admin.routes')

const routes = Router()

routes.use('/account', accountRoutes)
routes.use('/users', usersRoutes)
routes.use('/admin', adminRoutes)

module.exports = routes