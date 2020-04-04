const Phaser = require('phaser');
const client = require('../SocketClient');

class Lobby extends Phaser.Scene {

    constructor() {
        super("Lobby");
    }

    create() {
        // Respond to being declared the VIP
        client.on("declareVIP", this.onDeclareVIP.bind(this));
    }

    emitStartGame() {
        client.emit("start");
    }

    onDeclareVIP() {
        // Create Start button
        this.add.text(640, 600, "Start The Game")
            .setOrigin(0.5).setFontSize(36);
        this.add.rectangle(640, 600, 320, 80, 0x88FF88, 0.5)
            .setOrigin(0.5).setInteractive()
            // When the box is clicked, ask the server to start the game
            .on('pointerdown', this.emitStartGame, this);
        // Accept the VIP position and verify the signal was received
        client.emit('acceptVIP');
    }

}

module.exports = Lobby;