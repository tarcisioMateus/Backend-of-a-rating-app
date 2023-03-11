const { Router } = require('express')

const HistoryController = require('../controllers/HistoryController')
const historyController = new HistoryController()

const historyRoutes = Router()

historyRoutes.use('/index/:admin_id', historyController.index)
historyRoutes.use('/show/:id', historyController.show)
historyRoutes.use('/undo/:admin_id/:id', historyController.undo)
historyRoutes.use('/delete/:admin_id', historyController.delete)

module.exports = historyRoutes