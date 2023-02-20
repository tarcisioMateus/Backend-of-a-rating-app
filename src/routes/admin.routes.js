const { Router } = require('express')

const AdminController = require('../controllers/AdminController')
const adminController = new AdminController()

const adminRoutes = Router()

adminRoutes.post('/addAlbum', adminController.addAlbum)
adminRoutes.delete('/deleteAlbum/:album_id', adminController.deleteAlbum)

module.exports = adminRoutes