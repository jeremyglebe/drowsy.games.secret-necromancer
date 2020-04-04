// Temporary for testing!!!
// Create a client connection.
const client = require('../client/SocketClient');

async function clientTest() {
    client.connectTo('Jeremy', 'localhost', 3000);
    // Test that starting and locking out players works
    // client.emit('start');
    // await sleep(1000);
    // Test that duplicate names are rejected
    client.connectTo('Jeremy', 'localhost', 3000);
    client.connectTo('Bob', 'localhost', 3000);
    client.connectTo('Frank', 'localhost', 3000);
    client.connectTo('Joe', 'localhost', 3000);
    client.connectTo('Kevin', 'localhost', 3000);
    // Test that more than 5 players gets a rejection
    client.connectTo('Rachel', 'localhost', 3000);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

clientTest();