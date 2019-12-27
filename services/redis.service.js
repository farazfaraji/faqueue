const redis = require("redis");
const di = require("./../di");
class Redis {
    constructor(db=0){
        this.redisClient = redis.createClient(`redis://${di.connection.redisHost}:${di.connection.redisPort}`); //redis://g2-redis:6379
        this.selectDB(db);
    }

    async listenNotifications(cb){
        const subscriber = await redis.createClient(`redis://${di.connection.redisHost}:${di.connection.redisPort}`);
        subscriber.config("SET", "notify-keyspace-events", "Ex");

        subscriber.on("message", function (channel, message) {
            cb(message,channel);
        });
        subscriber.subscribe("__keyevent@3__:expired");

    }

    async del(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.del(key,function (e) {
                resolve(true);
            });
        });
    }
    async set(key,value){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.set(key, value,function (e) {
                resolve(true);
            });
        });
    }
    async get(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.get(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async incr(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.incr(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async scan(scan){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.scan(0,"MATCH",scan,function (e,result) {
                resolve(result);
            });
        });
    }

    async decr(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.decr(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async hmset(key,value){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.hmset(key, value,function (e) {
                resolve(true);
            });
        });
    }

    async hmget(key,value){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.hmget(key, value,function (e,res) {
                resolve(res[0]);
            });
        });
    }

    async lpush(key,value){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.lpush(key, value,function (e) {
                resolve(true);
            });
        });
    }

    async rpush(key,value){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.rpush(key, value,function (e) {
                resolve(true);
            });
        });
    }

    async lpop(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.lpop(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async rpop(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.rpop(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async llen(key){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.llen(key,function (e,result) {
                resolve(result);
            });
        });
    }

    async lrange(key,min,max){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.lrange(key,min,max,function (e,result) {
                resolve(result);
            });
        });
    }

    getRedisClient()
    {
        return this.redisClient;
    }

    async lindex(key,data){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.lindex(key,data,function (e,result) {
                resolve(result);
            });
        });
    }

    async selectDB(db){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.select(db,function (e,result) {
                resolve(result);
            });
        });
    }

    async setAndExpire(key,value,timeInSecond){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.set(key, value,'EX', timeInSecond,function (e) {
                resolve(true);
            });
        });
    }

    async flushDb(){
        const redisClient = this.redisClient;
        return new Promise(function (resolve, reject) {
            redisClient.flushdb(function (e,result) {
                resolve(result);
            });
        });
    }
}

module.exports = {
    Redis
};