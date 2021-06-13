let router = require('express').Router();
let log = require('../utils/log')
let dbService = require("../service/db.service")
let uniqid = require('uniqid');

router.post('/new-slot', function (req, res, next) {
    if(!req.body){
        res.status(400).json({status: 400, message: "bad_request"})
    }
    dbService.saveParkSlot(req.body)
        .then(function(resp){
            res.status(200).json({status: 200, users: resp})
            return next()
        })
        .catch(function(err){
            log.error("error in park slot save - " + err)
            res.status(500).json({status: 500, message: err.name=="ValidationError" ? err.message : "internal_server_error"})
            return next()
        })
})

router.get('/stats', function (req, res, next) {
    dbService.getParkSlotAvailable().then(function(resp){
        res.status(200).json(resp)
        return next()
    })
    .catch(function (err) {
        log.error("err in available parking slot - available service call" + err)
        res.status(500).json({status: "500", message: "internal_server_error"})
        return next()
    })
})

router.get('/available', function (req, res, next) {
    dbService.showAvailableSlots().then(function(resp){
        res.status(200).json(resp)
        return next()
    })
    .catch(function (err) {
        log.error("err in available parking slot - show available service call" + err)
        res.status(500).json({status: "500", message: "internal_server_error"})
        return next()
    })
})

router.get('/booked', function (req, res, next) {
    dbService.showBookedSlots().then(function(resp){
        res.status(200).json(resp)
        return next()
    })
    .catch(function (err) {
        log.error("err in available parking slot - show booked service call" + err)
        res.status(500).json({status: "500", message: "internal_server_error"})
        return next()
    })
})

router.post('/book', function (req, res, next) {
    //validation
    if(quota != 'general' || quota != 'reserved'){
        return res.status(400).json({status: 400, message: "bad_request"})
    }
    const flag = req.body.quota == 'general' ? 0 : 1;
    dbService.isSlotBooked(req.body.name, flag)
        .then(function(code){
            if(code == 1){
                return res.status(200).json({status: 200, message: "slot_already_booked"})    
            }else if(code == -1){
                return res.status(404).json({status: 404, message: "user_not_found"})    
            }else{
                log.debug("--- booking parking slot")
                dbService.getParkSlotAvailable().then(function(resp){
                    if(resp.available > 0) {
                        const token = uniqid.time();
                        let exp = new Date();
                        exp = resp.available < Math.floor(resp.total/2) ? exp.setSeconds(exp.getSeconds()+30) : exp.setMinutes(exp.getMinutes()+15)
                        let quota = -1;
                        if(req.body.quota == 'general' && (Math.floor((resp.total*80)/100)-resp.b_general) > 0){
                            //save in db with general quota and return a token
                            quota = 0
                        }else if(req.body.quota == 'reserved'){
                            //save in db with general quota and return a token
                            quota = 1
                        } else {
                            res.status(200).json({status: 200, message: "no_slot_available"})    
                            return next()
                        }
                        log.debug("--- exp at " + exp)
                        let obj = {
                            booked_by: req.body.name,
                            quota: 0,
                            status: 1,
                            last_expires_at: exp,
                            last_booked_at: new Date(),
                            token
                        }
                        dbService.updateParkSlot(0, obj).then(function(updateResp){
                            log.debug("booked slot successfully")
                            res.status(200).json({status: 200, booked_at: obj.last_booked_at, token})
                            return next()
                        })
                        .catch(function(err){
                            log.error("err in parking slot booking - book service call" + err)
                            res.status(500).json({status: "500", message: "internal_server_error"})
                            return next()
                        })
                        
                    }else{
                        res.status(200).json({status: "200", message: "no_slot_available"})
                        return next()
                    }
                })
                .catch(function (err) {
                    log.error("err in reading parking slot - book service call" + err)
                    res.status(500).json({status: "500", message: "internal_server_error"})
                    return next()
                })
            }
        })
})

router.post('/checkin', function (req, res, next) {
    dbService.isBookingPresent(req.body.token)
        .then(function (flag) {
            log.debug("---is booking present :: "+flag)
            if(!flag){
                res.status(404).json({status: 404, message: "no_booking_on_given_token"})
                return next()
            }
            let exp = new Date()
            exp = exp.setMinutes(exp.getMinutes()+30)
            let obj = {
                status: 2,
                last_expires_at: new Date(exp)
            }
            dbService.updateParkSlot({token: req.body.token}, obj).then(function(updateResp){
                log.debug("claimed slot successfully")
                res.status(200).json({status: 200, expires_at: obj.last_expires_at})
                return next()
            })
            .catch(function(err){
                log.error("err in parking slot claim - checkin service call" + err)
                res.status(500).json({status: "500", message: "internal_server_error"})
                return next()
            })
        })
})

module.exports = router