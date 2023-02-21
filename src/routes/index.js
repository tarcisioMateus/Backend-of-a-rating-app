const { Router } = require('express')

const accountRoutes = require('./account.routes')
const usersRoutes = require('./users.routes')
const adminRoutes = require('./admin.routes')
const albumsRoutes = require('./albums.routes')
const ratingsRoutes = require('./ratings.routes')

const routes = Router()

routes.use('/account', accountRoutes)
routes.use('/users', usersRoutes)
routes.use('/admin', adminRoutes)
routes.use('/albums', albumsRoutes)
routes.use('/ratings', ratingsRoutes)

module.exports = routes