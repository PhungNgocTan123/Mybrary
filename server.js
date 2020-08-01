require('dotenv').config();
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

// view engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
// layouts
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

// Connect to mongoose 
const mongoose = require('mongoose')
const db = mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to mongoose'))
    .catch(() => console.log(error))


app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.PORT || 3000)
// https://git.heroku.com/mybraryphungngoctan.git
// m7ErJgvy5YpMPN1s