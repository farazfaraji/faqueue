const Datastore = require('nedb-promises');

const datastore = Datastore.create(__dirname + '/db.db');

async function addToDb(worker,update=false) {
    const dbWorker = await getWorker(worker.name);
    if(dbWorker===null)
        await datastore.insert(worker);
    else if(update)
        await updateWorker(worker.name,worker);
}

async function getWorker(name) {
    return await datastore.findOne({ "name": name })
}

async function updateWorker(name,worker){
    await datastore.update({name},worker);
}

async function removeWorker(name){
    await datastore.remove({name});
}

module.exports = {
    addToDb,
    getWorker,
    removeWorker
}



