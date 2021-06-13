module.exports = {
	"APP_NAME": "PARKING_LOT",
	"PORT": 9820,
	"BIND_IP": "0.0.0.0",
	"LOG_LEVEL": 3,
    "MONGO_URI": "mongodb://localhost:27017/test",
    "MONGO_OPTIONS": {
        dbName: 'test',
        poolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    "USER_COLLECTION": "users",
    "PARK_SLOT_COLLECTION": "park_slots"
}
