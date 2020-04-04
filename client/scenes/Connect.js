const Phaser = require('phaser');
const client = require('../SocketClient');

class Connect extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    username;
    /** @type {Phaser.GameObjects.Text} */
    usernamePrompt;
    /** Editor for the username text */
    usernameEditor;

    /** @type {Phaser.GameObjects.Text} */
    ipaddress;
    /** @type {Phaser.GameObjects.Text} */
    ipaddressPrompt;
    /** Editor for the ip address text */
    ipaddressEditor;

    /** @type {Phaser.GameObjects.Text} */
    port;
    /** @type {Phaser.GameObjects.Text} */
    portPrompt;
    /** Editor for the port text */
    portEditor;

    constructor() {
        super("Connect");
    }

    preload() {
        // Load text edit plugin
        this.load.plugin('rextexteditplugin', 'plugins/rextexteditplugin.min.js', true);
    }

    create() {
        // Create the prompts
        this.usernamePrompt = this.add.text(640, 80, "Enter a Username")
            .setOrigin(0.5).setFontSize(24);
        this.ipaddressPrompt = this.add.text(640, 240, "Enter the IP Address to connect to")
            .setOrigin(0.5).setFontSize(24);
        this.portPrompt = this.add.text(640, 400, "Enter the Port that the server is listening on")
            .setOrigin(0.5).setFontSize(24);

        // Create the text objects with default values
        this.username = this.add.text(640, 120, "Mr. E")
            .setOrigin(0.5).setFontSize(36);
        this.ipaddress = this.add.text(640, 280, "0.0.0.0")
            .setOrigin(0.5).setFontSize(36);
        this.port = this.add.text(640, 440, "3000")
            .setOrigin(0.5).setFontSize(36);
    }

}

module.exports = Connect;