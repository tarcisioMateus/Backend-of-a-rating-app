const { Router } = require('express')

const controlRoutes = require('./control.routes')

const AdminController = require('../controllers/AdminController')
const adminController = new AdminController()

const adminRoutes = Router()

adminRoutes.use('/control', controlRoutes)

adminRoutes.post('/addAlbum', adminController.addAlbum)
adminRoutes.delete('/deleteAlbum/:album_id', adminController.deleteAlbum)

module.exports = adminRoutes