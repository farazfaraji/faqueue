const neDb = require("./middleware/nedb");

const prefixJob = "faQueue_";
const di = require("./di");
const globalHelper = require("./helper/global.helper");

class queue{
    _pause = true;
    _initialized = false;
    constructor(worker){
        this.worker = worker;
        this.worker.name = prefixJob + this.worker.name;
    }
    async init(){
        let worker = this.worker;
        worker = await initializeVariables(worker);
        const me = await neDb.getWorker(worker.name);
        if(me!==null){
            if(!worker.override)
                throw new Error("faQueue: " + worker.name + " is exist.");
            if(!worker.keep_data)
                await di.redisDb0.del(worker.name);
            await neDb.addToDb(worker,worker.update);
        }
        else
            await neDb.addToDb(worker);
        this._initialized = true;
        this._pause = false;
        this.worker = worker;
    }
    async addToQueue(data){
        try {
            await this.__checkSystem();
            const fqData = {message:data,type:"fq",retried:0};
            await push(fqData,this.worker);
            return true;
        }catch (e) {
            throw new Error(e);
        }
    }
    async startFetch(){
        await this.__checkSystem();
        const worker = this.worker;
        const _pause = this._pause;
        setInterval(async function(){
            if(!_pause)
                return;
            for(let i = 0;i<worker.waitFor.length;i++){
                const lengthOfQueue = await di.redisDb0.llen(prefixJob +worker.waitFor[i]);
                if(lengthOfQueue!==0)
                    return;
            }
            let data = await di.redisDb0.rpop(worker.name);
            try{
                if(data){
                    data = JSON.parse(data);
                    worker.cb(data);
                }
            }catch (e) {
                throw new Error(e);
            }
        }, worker.interval);
    }
    async getLength(){
        await this.__checkSystem();
        return await di.redisDb0.llen(this.worker.name);
    }
    async setAsFailed(data,toEnd=true){
        await this.__checkSystem();
        if(data.type!=="fq")
            throw new Error("type of object is not faQueue type");
        data.retried += 1;
        if(toEnd)
            await push(data,this.worker);
        else
            await push(data,this.worker,false);
    }
    async getQueue(){
        await this.__checkSystem();
        let worker =  await neDb.getWorker(this.worker.name);
        delete worker["_id"];
        return worker;
    }
    async removeQueue(){
        await this.__checkSystem();
        await neDb.removeWorker(this.worker.name);
        await di.redisDb0.del(this.worker.name)
    }
    async pause(){
        this._pause = false;
    }
    async resume(){
        this._pause = true;
    }

    async __checkSystem(){
        if(!this._initialized)
            throw new Error("faQueue: queue doesn't initialized yet!");
        globalHelper.checkConnection();
    }
}
async function push(data,worker,l=true){
    if(data.retried===worker.max_try+1)
        return;
    data = JSON.stringify(data);
    if(l)
        await di.redisDb0.lpush(worker.name,data);
    else
        await di.redisDb0.rpush(worker.name,data);
}
async function initializeVariables(worker){

    if(worker.name ==="" || worker.name===undefined || worker.name === null)
        throw new Error("FaQueue: worker name can not be empty. queue has been stopped!");

    if(worker.waitFor===undefined)
        worker.waitFor = [];

    if(worker.interval===undefined)
        worker.interval = 1000;

    if(worker.max_try===undefined)
        worker.max_try = 3;

    if(worker.override===undefined)
        worker.override = false;

    if(worker.keep_data===undefined)
        worker.keep_data = true;

    if(worker.update===undefined)
        worker.update = true;
    return worker;
}

module.exports = queue;