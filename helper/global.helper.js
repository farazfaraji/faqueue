const di = require("./../di");
function checkConnection() {
    if(!di.connection.status)
        throw new Error("faQueue: your queue doesn't connect to the redis");
}

module.exports = {
    checkConnection,
}