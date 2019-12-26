const di = require("./di");
const redisService = require("./services/redis.service");

function connect(redisHost, redisPort, db = 0) {
    di.connection = {status:true,redisHost, redisPort, db};
    di.redisDb0 = new redisService.Redis(db);
}

module.exports = {
    connect,
};