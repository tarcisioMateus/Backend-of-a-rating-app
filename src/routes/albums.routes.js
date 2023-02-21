const { Router } = require('express')

const AlbumsController = require('../controllers/AlbumsController')
const albumsController = new AlbumsController()

const albumsRoutes = Router()

albumsRoutes.get('/allTags', albumsController.listAllTags)
albumsRoutes.get('/show/:id', albumsController.show)
albumsRoutes.get('/index', albumsController.index)

module.exports = albumsRoutes