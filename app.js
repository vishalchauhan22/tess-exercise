// require('dotenv').config();
let config = require("./config")
let express = require('express');
let http = require('http');
let log = require('./utils/log');
let mongoose = require("mongoose")
let bodyParser = require('body-parser')
const app = express();
const port = process.argv.slice(2)[0] || config.PORT;

mongoose.connect(config.MONGO_URI, config.MONGO_OPTIONS);
mongoose.connection.on('connected', function() {
    log.info('MONGODB CONNECTED');
});

mongoose.connection.on('disconnected', function() {
    log.error('MONGODB DISCONNECTED');
});

mongoose.connection.on('reconnected', function() {
    log.warn('MONGODB RECONNECTED');
});

mongoose.connection.on('error', function(err) {
    log.error(`MONGODB ERROR ${err}`);
});
mongoose.set('useFindAndModify', false);
// mongoose.set('debug', true);
// mongoose.set('debug', function (coll, method, query, doc, val) {
//     log.debug(">>>>>>>>> ", coll, query, method, doc);
// });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    log.debug("<<< "+ req.url)
    next();
})
app.use('/user/', require('./routes/user.route'))
app.use('/park/', require('./routes/parking.route'))

app.use(function (req, res, next) {
    log.debug(">>> response")
    next();
})

const server =http.createServer(app).listen(parseInt(port));
log.info(`app started on ${port}`)


