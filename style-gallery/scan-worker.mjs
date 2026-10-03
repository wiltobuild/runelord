import {parentPort} from 'node:worker_threads';
import {scan} from './server.mjs';
parentPort.on('message',()=>{try{parentPort.postMessage({state:scan()})}catch(error){parentPort.postMessage({error:error.message})}});
