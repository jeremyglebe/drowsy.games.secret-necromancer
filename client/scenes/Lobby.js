const Phaser = require('phaser');
const client = require('../SocketClient');

class Lobby extends Phaser.Scene {

    constructor() {
        super("Lobby");
        // Is the user the VIP user
        this.vip = false;
    }

    init(data) {
        this.vip = data.vip ? true : false;
    }

    create() {
        if (this.vip)
            this.createStartButton();
        client.emit('greeting');
    }

    emitStartGame() {
        client.emit("start");
    }

    createStartButton() {
        // Create Start button
        this.add.text(640, 600, "Start The Game")
            .setOrigin(0.5).setFontSize(36);
        this.add.rectangle(640, 600, 320, 80, 0x88FF88, 0.5)
            .setOrigin(0.5).setInteractive()
            // When the box is clicked, ask the server to start the game
            .on('pointerdown', this.emitStartGame, this);
    }

}

module.exports = Lobby;