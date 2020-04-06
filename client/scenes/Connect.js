const Phaser = require('phaser');
const client = require('../SocketClient');

class Connect extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    username;
    /** Editor for the username text */
    usernameEditor;
    /** @type {Phaser.GameObjects.Rectangle} */
    usernameButton;

    /** @type {Phaser.GameObjects.Text} */
    ipaddress;
    /** Editor for the ip address text */
    ipaddressEditor;
    /** @type {Phaser.GameObjects.Rectangle} */
    ipaddressButton;

    /** @type {Phaser.GameObjects.Text} */
    port;
    /** Editor for the port text */
    portEditor;
    /** @type {Phaser.GameObjects.Rectangle} */
    portButton;

    constructor() {
        super("Connect");
    }

    preload() {
        // Load text edit plugin
        this.load.plugin('rextexteditplugin', 'plugins/rextexteditplugin.min.js', true);
    }

    create() {
        //create the background
        let bg = this.add.sprite(0,0,"connectscreen_graphic").setOrigin(0,0);
        //add title
        let title = this.add.sprite(0,0,"title_graphic").setOrigin(0,0);
        // Create the prompts
        this.add.text(640, 80, "Enter a Username")
            .setOrigin(0.5).setFontSize(24);
        this.add.text(640, 240, "Enter the IP Address to connect to")
            .setOrigin(0.5).setFontSize(24);
        this.add.text(640, 400, "Enter the Port that the server is listening on")
            .setOrigin(0.5).setFontSize(24);

        // Create the text objects with default values
        this.username = this.add.text(640, 140, "Mr. E")
            .setOrigin(0.5).setFontSize(36);
        this.ipaddress = this.add.text(640, 300, "0.0.0.0")
            .setOrigin(0.5).setFontSize(36);
        this.port = this.add.text(640, 460, "3000")
            .setOrigin(0.5).setFontSize(36);

        // Create and close editors for text objects
        this.usernameEditor = this.plugins.get('rextexteditplugin').edit(this.username);
        this.usernameEditor.close();
        this.ipaddressEditor = this.plugins.get('rextexteditplugin').edit(this.ipaddress);
        this.ipaddressEditor.close();
        this.portEditor = this.plugins.get('rextexteditplugin').edit(this.port);
        this.portEditor.close();

        // Create buttons/backgrounds for text
        this.createEditorButton(this.usernameButton, this.usernameEditor, 640, 140);
        this.createEditorButton(this.ipaddressButton, this.ipaddressEditor, 640, 300);
        this.createEditorButton(this.portButton, this.portEditor, 640, 460);

        // Create Join button
        this.add.text(640, 600, "Join Server")
            .setOrigin(0.5).setFontSize(36);
        this.add.rectangle(640, 600, 240, 50, 0x88FF88, 0.5)
            .setOrigin(0.5).setInteractive()
            // When the box is clicked, open the editor
            .on('pointerdown', this.joinButtonClicked, this);
    }

    createEditorButton(rectangle, editor, x, y) {
        rectangle = this.add.rectangle(x, y, 320, 50, 0x888888, 0.5)
            .setOrigin(0.5).setInteractive()
            // When the box is clicked, open the editor
            .on('pointerdown', () => {
                editor.open({
                    // When the editor changes the text, run this function
                    onTextChanged: (textObject, text) => {
                        textObject.text = text;
                    }
                });
            }, this);
    }

    joinButtonClicked() {
        client.connectTo(this.username.text, this.ipaddress.text, parseInt(this.port.text, 10));
        client.on('accept connection', (playerType) => {
            this.scene.start('Lobby', {
                vip: playerType == 'vip'
            });
        });
        client.on('reject connection', (message) => {
            alert("Server rejected connection: " + message);
        });
    }

}

module.exports = Connect;