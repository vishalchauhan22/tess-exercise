const mongoose = require('mongoose');
// mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;
let config = require("../config")

/**
 * disability:
 * 0 - true
 * 1 - false
 */
let UserSchema = new Schema({
    name: {type: String, required: true, max: 30},
    disability: {type: Number, required: true}
}, {
    collection: config.USER_COLLECTION,
    timestamps: true
});

// Export the model
module.exports = mongoose.model(config.USER_COLLECTION, UserSchema);
