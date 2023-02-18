require('express-async-errors')
const appError = require('./utils/appError')

const express = require('express')

const app = express()
app.use(express.json())

app.use(( error, request, response, next ) => {
    if (error instanceof appError) {
        return response.status(error.status).json(error.message)
    }
    return response.status(500).json(`Internal Server Error :> ${error.message}`)
})

const PORT = 3333
app.listen(PORT, console.log(PORT))