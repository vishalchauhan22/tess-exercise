const config = require("../config")
const {LOG_LEVEL} = require("../config")

module.exports = {

    info: (args)=>{
        const now = new Date()
        console.log(`${now.toLocaleString()} [${config.APP_NAME}] [INFO ] ${args}`)
    },
    error: (args)=>{
        const now = new Date()
        console.log(`${now.toLocaleString()} [${config.APP_NAME}] [ERROR] ${args}`)
    },
    debug: (args)=>{
        if(LOG_LEVEL < 3) return;
        const now = new Date()
        console.log(`${now.toLocaleString()} [${config.APP_NAME}] [DEBUG] ${args}`)
    },
    warn: (args)=>{
        const now = new Date()
        console.log(`${now.toLocaleString()} [${config.APP_NAME}] [WARN ] ${args}`)
    },
}
