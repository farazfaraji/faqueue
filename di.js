const eventEmitterLibrary = require('events');
const eventEmitter = new eventEmitterLibrary();
let redisDb0;

let connection = {status:false,redisHost:null, redisPort:null, db:null};

module.exports = {
    connection,
    eventEmitter,
    redisDb0
};