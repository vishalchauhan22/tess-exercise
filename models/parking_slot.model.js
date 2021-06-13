const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let config = require("../config")

/**
 * general quota : 0
 * reserved quota: 1
 * 
 * available: quota : -1
 * 
 * status:
 * 0 - available
 * 1 - booked
 * 2 - claimed / occupied
 */
let ParkSlotSchema = new Schema({
    booked_by: {type: String, max: 30},
    quota: {type: Number, default: 0},
    status: {type: Number, default: 0},
    last_expires_at: {type: Date, default: 0},
    last_booked_at: {type: Date, default: 0},
    token: {type: String, max: 30},
}, {
    collection: config.PARK_SLOT_COLLECTION,
    timestamps: true
});

// Export the model
module.exports = mongoose.model(config.PARK_SLOT_COLLECTION, ParkSlotSchema);
