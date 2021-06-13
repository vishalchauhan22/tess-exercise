let router = require('express').Router();
let dbService = require("../service/db.service")
let log = require('../utils/log')

router.post('/register', function (req, res, next) {
    if(!req.body){
        res.status(400).json({status: 400, message: "bad_request"})
    }
    dbService.saveUser(req.body)
        .then(function(resp){
            res.status(200).json({status: 200, users: resp})
            return next()
        })
        .catch(function(err){
            log.error("error in list usr route save - " + err)
            res.status(500).json({status: 500, message: err.name=="ValidationError" ? err.message : "internal_server_error"})
            return next()
        })
})

router.get('/list', function (req, res, next) {
    dbService.listUsers()
        .then(function(resp){
            res.status(200).json({status: 200, users: resp})
            return next()
        })
        .catch(function(err){
            log.error("error in list usr route list - " + err)
            res.status(500).json({status: 500, message: "internal_server_error"})
            return next()
        })
})

module.exports = router