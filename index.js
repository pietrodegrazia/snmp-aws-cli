var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var Cookie = require('cookie-parser')

var app = express()
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('trust proxy', 1)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(Cookie())
app.locals.siteURL = "http://localhost:5000/"

app.use('/', require('./controllers/index-controller'))
app.use('/regions', require('./controllers/index-controller'))
app.use('/public', express.static(path.join(__dirname, '/public')))

var port = process.env.PORT || 5000
var httpServer = require('http').createServer(app)
httpServer.listen(port, function() {
    console.log('aws-snpm running on port ' + port + '.')
})