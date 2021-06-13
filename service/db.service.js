const log = require("../utils/log")
let User = require('../models/user.model')
let Park = require('../models/parking_slot.model')

module.exports = {
    getParkSlotAvailable: function (id) {
        let self = this
        log.debug("--- query mongo get available slots");
        let parkAsyncRequest = new Promise(function (resolve, reject) {
                return self.getParkingCount().then(function (count) {
                    Park.aggregate([
                        {
                            $match: {
                                last_expires_at: {
                                    $lt : new Date()
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$quota",
                                count: { $sum: 1 }
                            }
                        }
                    ], function (err, slot) {
                        if (err){
                            log.error(err);
                            return reject({ error: err });
                        }
                        let total=0,available=0,booked=count.booked,b_general=count.b_general,b_reserved=count.b_reserved;
                        total += count.total
                        slot.forEach(e => {
                            available += e.count
                            total += e.count
                        });
                        // total = available+booked;
                        return resolve({total,booked,available,b_general,b_reserved});
                    });
                });  
            })
        return parkAsyncRequest;
    },
    getParkingCount: function(){
        return new Promise(function (resolve, reject) {
            return Park.aggregate([
                {
                    $match: {
                        last_expires_at: {
                            $gte : new Date()
                        }
                    }
                },
                {
                    $group: {
                        _id: "$quota",
                        count: { $sum: 1 }
                    }
                }
            ], function (countErr, count) {
                if(countErr) {
                    log.error("--- error in getting total parking count " + countErr)
                    return reject(countErr)
                }
                let total=0,b_general=0, b_reserved=0,booked=0;
                count.forEach(e => {
                    total+= e.count
                    if(e._id==0){
                        booked += e.count
                        b_general += e.count
                    }
                    if(e._id==1){
                        booked += e.count
                        b_reserved += e.count
                    }
                });
                return resolve({b_general, b_reserved,total, booked})
            })
        })
    },
    isSlotBooked: function (name, flag) {
        let self = this;
        return new Promise(function (resolve, reject) {
            return self.userExists(name)
                .then(function(resp){
                    if(!resp){
                        return resolve(-1)
                    }
                    if(resp.disability != flag){
                        log.warn("--- user disability check mismatch :: " + resp.disability + " :: " + flag)
                        return resolve(-1)
                    }
                    log.debug("--- user disability check match")
                    // let userAsyncRequest = new Promise(function (cResolve, cReject) {
                        Park.findOne({ booked_by: name, last_expires_at : { $gt: new Date() } }, function (err, parkSlot) {
                            if (err){
                                log.error(err);
                                return reject({ error: err });
                            }
                            log.debug("--- slot found :: " + parkSlot)
                            // return resolve(userdetails ? userdetails.toObject() : userdetails);
                            if(!parkSlot){
                                return resolve(0)
                            }
                            return resolve(1)
                        });
                    // });
                    // return userAsyncRequest;
                })
                .catch(function(err){
                  log.error("slot check error "+ err)
                  return reject(err)
                })
        })
    },
    userExists: function (name) {
        let userAsyncRequest = new Promise(function (resolve, reject) {
            log.debug("--- find user in mongo :: " + name)
            return User.findOne({ name }, function (err, userdetails) {
                if (err){
                    log.error(err);
                    return reject({ error: err });
                }
                return resolve(userdetails);
            });
        });
        return userAsyncRequest;
    },
    showAvailableSlots: function (prop,delta) {
        let parkAsyncRequest = new Promise(function (resolve, reject) {
            Park.find({last_expires_at : { $lt: new Date() }}, { _id:1, }, function(err, doc){
                if (err){
                    log.error(err);
                    return reject(err);
                }
                return resolve(doc)
            })
        });
        return parkAsyncRequest;
    },
    showBookedSlots: function (prop,delta) {
        let parkAsyncRequest = new Promise(function (resolve, reject) {
            Park.find({last_expires_at : { $gt: new Date() }}, { _id:1, booked_by: 1, last_expires_at: 1, status: 1}).lean().exec(function(err, doc){
                if (err){
                    log.error(err);
                    return reject(err);
                }
                let op = []
                doc.forEach(e => {
                    e.expires_at = e.last_expires_at.toLocaleString()
                    delete e.last_expires_at 
                    if(e.status == 1){
                        e.status =  "waiting"
                    }else{
                        e.status =  "occupied"
                    }
                    op.push(e)
                });
                return resolve(op)
            })
        });
        return parkAsyncRequest;
    },
    updateParkSlot: function (prop,delta) {
        let parkAsyncRequest = new Promise(function (resolve, reject) {
            log.info("Updating park ::"+"ID : XXXXXX");
            let query = prop ? prop : {last_expires_at : {$lt: new Date()}};
            Park.findOneAndUpdate(query, { ...delta}, {upsert:true}, function(err, doc){
                if (err){
                    log.error(err);
                    return reject(err);
                }
                return resolve(doc)
            })
        });
        return parkAsyncRequest;
    },
    listParkSlots: function (name) {
        let userAsyncRequest = new Promise(function (resolve, reject) {
            return Park.find({  }, function (err, userdetails) {
                if (err){
                    log.error(err);
                    return reject({ error: err });
                }
                return resolve(userdetails);
            });
        });
        return userAsyncRequest;
    },
    isBookingPresent: function (token) {
        let parkAsyncRequest = new Promise(function (resolve, reject) {
            Park.findOne({token: token, last_expires_at : { $gt: new Date() }}, function(err, doc){
                if (err){
                    log.error(err);
                    return reject(err);
                }
                return resolve(!!doc)
            })
        });
        return parkAsyncRequest;
    },
    getUser: function (name) {
        let userAsyncRequest = new Promise(function (resolve, reject) {
            return User.findOne({ name }, function (err, userdetails) {
                if (err){
                    log.error(err);
                    return reject({ error: err });
                }
                return resolve(userdetails ? userdetails.toObject() : userdetails);
            });
        });
        return userAsyncRequest;
    },
    listUsers: function (name) {
        let userAsyncRequest = new Promise(function (resolve, reject) {
            return User.find({  }, function (err, userdetails) {
                if (err){
                    log.error(err);
                    return reject({ error: err });
                }
                return resolve(userdetails);
            });
        });
        return userAsyncRequest;
    },
    saveUser: function (delta) {
        let userUpdateRequest = new Promise(function (resolve, reject) {
            log.info("Save user ::", "ID : XXXXXX");
            user = new User({...delta})
            user.save({ ...delta}, function(err, doc){
                if (err){
                    log.error("Save user erro ::"+err);
                    return reject(err);
                }
                return resolve(doc)
            })
        });
        return userUpdateRequest;
    },
    saveParkSlot: function (delta) {
        let userUpdateRequest = new Promise(function (resolve, reject) {
            log.info("Save Park slot ::", "ID : XXXXXX");
            park = new Park({...delta})
            park.save({ ...delta}, function(err, doc){
                if (err){
                    log.error("Save park slot erro ::"+err);
                    return reject(err);
                }
                return resolve(doc)
            })
        });
        return userUpdateRequest;
    }
}