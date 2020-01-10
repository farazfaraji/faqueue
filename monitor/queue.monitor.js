const di = require("./../di");
const _ = require("lodash");

const BASIC_INFO = "faQueue_monitor_basic_info";

class queue_monitor{
    async addToMonitor(worker){
        let lastData = await di.redisDb0.get(BASIC_INFO);
        if(lastData===null)
            lastData = [worker];
        else
        {
            lastData = JSON.parse(lastData);
            const resId = _.findIndex(lastData,{name:worker.name});
            delete lastData[resId];
            lastData.push(worker);
        }
        const filtered = lastData.filter(Boolean);
        await di.redisDb0.set(BASIC_INFO ,JSON.stringify(filtered));
    }
    async getQueues() {
        let lastData = await di.redisDb0.get(BASIC_INFO);
        if(lastData===null)
            return [];
        return JSON.parse(lastData);
    }
    async _removeQueue(obj){
        let lastData = await di.redisDb0.get(BASIC_INFO);
        if(lastData===null)
            lastData = [obj];
        else
        {
            lastData = JSON.parse(lastData);
            const resId = _.findIndex(lastData,{name:obj.name});
            delete lastData[resId];
        }
        const filtered = lastData.filter(Boolean);
        await di.redisDb0.set(BASIC_INFO ,JSON.stringify(filtered));
    }
    async _getQueue(obj){
        let lastData = await di.redisDb0.get(BASIC_INFO);
        if(lastData===null)
            return null;
        else
        {
            lastData = JSON.parse(lastData);
            return _.find(lastData,{name:obj.name});
        }
    }
}

module.exports = queue_monitor;