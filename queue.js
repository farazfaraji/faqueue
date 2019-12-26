const uuidv1 = require('uuid/v1');

const di = require("./di");
const globalHelper = require("./helper/global.helper");

class queue{
    constructor(worker){
        this.worker = worker;
        this.worker.name = "faQueue_" + this.worker.name
    }
    async addToQueue(data){
        try {
            globalHelper.checkConnection();
            const fqData = {message:data,type:"fq",retried:0};
            await this._push(fqData);
            return true;
        }catch (e) {
            console.log(e);
            return false;
        }
    }
    async startFetch(){
        const worker = this.worker;
        setInterval(async function(){
            let data = await di.redisDb0.rpop(worker.name);
            try{
                if(data){
                    data = JSON.parse(data);
                    worker.cb(data);
                }
            }catch (e) {
            }
        }, worker.interval);
    }
    async getInfo(){
        const llen = await di.redisDb0.llen(this.worker.name);
        di.eventEmitter.emit("onLen", llen);
    }
    async _push(data,l=true){
        if(data.retried===this.worker.max_try+1)
            return;
        data = JSON.stringify(data);
        if(l)
            await di.redisDb0.lpush(this.worker.name,data);
        else
            await di.redisDb0.rpush(this.worker.name,data);
    }
    async setAsFailed(data,toEnd=true){
        if(data.type!=="fq")
            throw new Error("type of object is not faQueue type");
        data.retried += 1;
        if(toEnd)
            await this._push(data);
        else
            await this._push(data,false);
    }
}

module.exports = queue;