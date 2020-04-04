const Phaser = require('phaser');
const client = require('../SocketClient');

class Lobby extends Phaser.Scene {

    constructor() {
        super("Lobby");
        // Is the user the VIP user
        this.vip = false;
        // Player nametags to tell you who's in the game
        this.tags = [];
    }

    init(data) {
        this.vip = data.vip ? true : false;
    }

    create() {
        // Create player list
        this.tags.push(this.add.text(640, 80, "Sorcerers Gathered")
            .setOrigin(0.5).setFontSize(36));
        // Create start button for VIP player
        if (this.vip)
            this.createStartButton();
        client.emit('greeting');
        // Add a name tag when a play joins
        client.on('update players', this.onUpdatePlayers.bind(this));
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

    onUpdatePlayers(data) {
        console.log("Updating players!");
        // Destroy all old tags
        for (let i = 1; i <= 5; i++) {
            if (this.tags[i]) {
                this.tags[i].destroy();
                delete (this.tags[i]);
            }
        }
        // Create username tags
        let i = 0
        for (let name of data.usernames) {
            // Create a name tag for the player
            this.tags.push(this.add.text(640, 120 + (40 * i), name)
                .setOrigin(0.5).setFontSize(36)
                // Make the name purple if they're the VIP
                .setColor(data.vip == name ? '#F0F' : '#FFF'));
            i++;
        }
    }

}

module.exports = Lobby;