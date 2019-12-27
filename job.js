const uuidv1 = require('uuid/v1');

const di = require("./di");
const globalHelper = require("./helper/global.helper");

class job{
    constructor(worker,cb){
        this.worker = worker;
        this.worker.name = "faJob_" + this.worker.name;
        this.cb = cb;
        let parent = this;
        di.redisDb0.listenNotifications(function (message,channel) {
            parent.expiredKey(message,channel)
        });
    }
    async expiredKey(message,channel)
    {
        const key = message.replace("fjJobT","fjJobD");
        const value = await di.redisDb0.get(key);
        await di.redisDb0.decr("faJob_Length_" + this.worker.name);
        await di.redisDb0.del(key);
        this.cb(JSON.parse(value));
    }
    async addJob(data,time){
        try {
            globalHelper.checkConnection();
            if(time.second===undefined)
                time.second = 0;
            if(time.minute===undefined)
                time.minute = 0;
            if(time.hour===undefined)
                time.hour = 0;
            if(time.day===undefined)
                time.day = 0;

            const _time = time.second + (time.minute * 60) + (time.hour * 60 * 60) + (time.day * 60 * 60 * 24);
            const fqData = {message:data,type:"fj",retried:0,time:_time};
            await this._push(fqData,_time);
            return true;
        }catch (e) {
            console.log(e);
            return false;
        }
    }
    async _push(data, expire){
        if(data.retried===this.worker.max_try+1)
            return;
        data = JSON.stringify(data);
        const uuid = uuidv1();
        await di.redisDb0.setAndExpire("fjJobT_" + this.worker.name + "_" +uuid,1,expire);
        await di.redisDb0.set("fjJobD_" + this.worker.name + "_" + uuid,data);
        await di.redisDb0.incr("faJob_Length_" + this.worker.name);
    }
    async setAsFailed(data){
        if(data.type!=="fj")
            throw new Error("type of object is not faJob type");
        data.retried += 1;
        await this._push(data,data.time);
    }

    async getLength(){
        return await di.redisDb0.get("faJob_Length_" + this.worker.name);
    }

    async _findKeys(){
        return await di.redisDb0.scan("*fjJob*" + this.worker.name + "*");
    }

    async removeJob(){
        await di.redisDb0.del("faJob_Length_" + this.worker.name);
        let keys = await this._findKeys();
        while(keys[1].length!==0){
            for(let i = 0;i<keys[1].length;i++)
                await di.redisDb0.del(keys[1][i]);
            keys = await this._findKeys();
        }
        return true;
    }
}

module.exports = job;