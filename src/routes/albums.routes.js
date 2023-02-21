const { Router } = require('express')

const AlbumsController = require('../controllers/AlbumsController')
const albumsController = new AlbumsController()

const albumsRoutes = Router()

albumsRoutes.get('/allTags', albumsController.listAllTags)

module.exports = albumsRoutes