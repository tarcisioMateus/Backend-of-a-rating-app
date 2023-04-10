const { Router } = require('express')

const HistoryController = require('../controllers/HistoryController')
const historyController = new HistoryController()

const historyRoutes = Router()

historyRoutes.get('/index/:admin_id', historyController.index)
historyRoutes.get('/show/:id', historyController.show)
historyRoutes.put('/undo/:admin_id/:id', historyController.undo)
historyRoutes.delete('/delete/:admin_id', historyController.delete)

module.exports = historyRoutes