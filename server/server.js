const server = require('./SocketServer');
const readline = require('readline-promise').default;

// Host address
var host = 'localhost';
// Host port
var port = 3000;

// Create a reader object using readline
var reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
reader.questionAsync('Enter the host address: ').then((inputHost) => {
    reader.questionAsync('Enter the server\'s port: ').then((inputPort) => {
        // Assign the entered host and port if they aren't just blank
        if (inputHost.trim() != '')
            host = inputHost;
        if (inputPort.trim() != '')
            port = inputPort;
        // Start the server
        initializeServer();
    });
});

function initializeServer() {
    // Start the server's listener
    server.http.listen(port, host, function () {
        console.log('listening on ' + host + ':' + port);
    });
    // Start the next scene
    nextScene();
}

function nextScene() {
    require('./scenes/Lobby');
}