const http = require('http');
const WebSocketServer = require('websocket').server;
const httpServer = http.createServer();
const webSocketServer = new WebSocketServer({
    httpServer
})
const PORT = process.argv[2]|| 8080
let connection = null
httpServer.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
webSocketServer.on('request', request => {
    connection = request.accept(null, request.origin);
    connection.on('message', message => {
        console.log(`I received a message ${message.utf8Data}`);
        connection.sendUTF(`Hello Client! Received message on port: ${PORT}`);
    });
    connection.on('close', (reasonCode, description) => {
        console.log('Client has disconnected.');
    });
});