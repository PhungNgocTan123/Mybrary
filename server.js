require('dotenv').config();
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

// view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
// layouts
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

// Connect to mongoose 
const mongoose = require('mongoose')
const db = mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to mongoose'))
    .catch(() => console.log(error))


app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)