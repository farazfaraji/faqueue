faQueue<br>
-
<p style="font-size:30px">simple persist Queue and Job manager based on Redis on Node Js</p>
this package will update every week and anyone can contirbute our git.<br>
faQueue can handle failed requests and put it back to the line<br><br>
ATTENTION:<br>
dont forget to run redis on your machine first

<b>Versions:</b><br>
- 
- <b>1.0.5</b>:
  - queue's can wait for other queue's to finish.
- <b>1.0.4</b>:
  - get length of job function added
  - delete and clean job
  - delete and clean queue
- <b>1.0.3</b>:
  - get length of queue function added
- <b>1.0.2</b>:
  - bug fix


<b>Usages:</b><br>
- 
- <b>When you want to run some task at defined time.<br></b>
example: send notification to user 2 hours later after setting appointment

- <b>When you want to create a queue and get data every 5 seconds</b><br>
example: when you want to send many requests to the any endpoint, but you do not want to send all of the request together.<br>

<b>How to use:</b>
-
- <b>Queue</b><br>
```js
const faQueue = require("faqueue");
const queue = require("faqueue/queue");
faQueue.connect("0.0.0.0",8586,3);// set your redis host and port and database (0-12)
let queueObject =  new queue({name: "test", interval: 3000, cb: receivedQueue,max_try:2,waitFor:["Other queue name"]}); // interval as ms

async function receivedQueue(data) {
    console.log(data.message);
    if(data.message.status===false)
        await queueObject.setAsFailed(data);
}

async function testQueue() {
    await queueObject.addToQueue({data: "hello",status:false});
    await queueObject.addToQueue({data: "hello world",status:true});
    await queueObject.startFetch();
}
testQueue();

```

- <b>Job</b>
<br>

```js
const faQueue = require("faqueue");
const job = require("faqueue/job");
faQueue.connect("0.0.0.0",8586,3);
let jobObject =  new job({name: "test",max_try:2},jobReceived);

async function jobReceived(data){
    console.log(data.message);
    if(data.message.status===false)
        await jobObject.setAsFailed(data);
}
async function testJob(){
// available parameters is second,minute,hour,day. they are optional but you need to set one of them
    await jobObject.addJob({data:"hello",status:false},{second:3});
    await jobObject.addJob({data:"hello 1",status:true},{second:3,hour:4});
    await jobObject.addJob({data:"hello 2",status:false},{second:3,minute:21,hour:3,day:2});
    }
testJob();

```

- <b>Examples on Github</b><br>
Open this url: https://github.com/adonisrayan/faqueue-example.git

<b> Queue Functions </b>
-
- <b>constructor (worker:worker object):</b> {name: "name_of_queue", interval: "interval_time_in_ms", cb: "callback function",max_try:"maximum try for failed times" }.

- <b>addToQueue (data:string | json):</b>  to add item to the end of the queue.

- <b>startFetch():</b> start pop from line.

- <b>setAsFailed(data: faQueue object,toEnd=true):</b> call this function to add object to the first or end of line again

- <b>getLength():</b> get length of line

- <b>removeQueue():</b> remove and clean queue

<b> Job Functions </b>
-
- <b>constructor (worker:worker object):</b> {name: "name of job",max_try:"maximum try for failed times"},"Callback function" }.

- <b>addJob (data:string | json):</b>  to add item to jobs.

- <b>setAsFailed(data: faQueue object,toEnd=true):</b> call this function to add object to jobs list again.

- <b>getLength():</b> get length of jobs object

- <b>removeJob():</b> remove and clean jobs list



