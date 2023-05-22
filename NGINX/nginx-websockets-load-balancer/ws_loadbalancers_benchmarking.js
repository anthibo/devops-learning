const WebSocket = require('ws');
const fs = require('fs')

const LB_TYPE = process.argv[2] || 'layer_7'

const layer7LoadBalancerURL = 'ws://localhost:8080/wschat';
const layer4LoadBalancerURL = 'ws://localhost:80/wschat';
const heavyMessage = 'a'.repeat(100 * 100);

executeBenchmarkingTests(LB_TYPE);

function executeBenchmarkingTests(LB_TYPE) {
    switch (LB_TYPE) {
        case 'layer_7':
            testLayer7LoadBalancerWS();
            break;
        case 'layer_4':
            testLayer4LoadBalancerWS();
            break;
        default:
            testLayer7LoadBalancerWS();
    }
};

function testLayer7LoadBalancerWS() {
    console.log('testing layer 7 loadbalancer websockets');
    let latencies = [];
    const layer7WS = new WebSocket(layer7LoadBalancerURL);
    layer7WS.on('open', () => {
        console.log('Connected to server');
        for (let i = 1; i <= 100; i++) {
            const start = Date.now();
            layer7WS.send(heavyMessage);
            layer7WS.once('message', () => {
                const end = Date.now();
                const latency = end - start;
                latencies.push(latency);
                console.log(`Latency: ${latency} ms`);
            });
        }
        layer7WS.close();
    });
    layer7WS.on('close', () => {
        console.log('Finished bencmarking on Layer 7 LoadBalancer Websockets');
        console.log(latencies);
        const sum = latencies.reduce((acc, val) => acc + val, 0);
        const average = sum / latencies.length;
        console.log(`Avg for 100 messages in layer 7 proxy is ${average}`);
        exportLatenciesDataToCSV(latencies)
    });
};

function testLayer4LoadBalancerWS() {
    console.log('testing layer 4 loadbalancer websockets');
    const layer4WS = new WebSocket(layer4LoadBalancerURL);
    let latencies = []
    layer4WS.on('open', () => {
        console.log('Connected to server');
        for (let i = 1; i <= 100; i++) {
            const start = Date.now();
            layer4WS.send(heavyMessage);
            layer4WS.once('message', () => {
                const end = Date.now();
                const latency = end - start;
                latencies.push(latency);
                console.log(`Latency: ${latency} ms`);
            });
        }
        layer4WS.close();
    });

    layer4WS.on('close', () => {
        console.log('Finished bencmarking on Layer 4 LoadBalancer Websockets');
        console.log(latencies);
        const sum = latencies.reduce((acc, val) => acc + val, 0);
        const average = sum / latencies.length;
        console.log(`Avg for 100 messages in layer 4 proxy is ${average}ms`);
        exportLatenciesDataToCSV(latencies);
    });
};


function exportLatenciesDataToCSV(latencies) {
    const csv = latencies.join('\n');
    const fileName = `${LB_TYPE}-${Date.now()}`
    fs.writeFile(fileName, csv, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('CSV data written to file');
    });
}