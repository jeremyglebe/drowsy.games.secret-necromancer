import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import { makeButton, textStyle } from '../classes/UI.js';

const MIN_PLAYERS = 4;

class Lobby extends Phaser.Scene {

    constructor() {
        super("Lobby");
    }

    init(data) {
        // Is the user the VIP (host)?
        this.vip = !!data.vip;
        // Player nametags to tell you who's in the game
        this.tags = [];
    }

    create() {
        // Messages can arrive while the scene is still being created, so track
        // liveness ourselves instead of using scene.isActive()
        this.alive = true;
        this.events.once('shutdown', () => { this.alive = false; });
        this.add.sprite(0, 0, "lobby_graphic").setOrigin(0, 0);
        this.add.text(640, 60, "Sorcerers Gathered", textStyle(40)).setOrigin(0.5);

        // Room code and invite link
        const code = client.roomCode;
        this.add.text(640, 400, `Room code: ${code}`, textStyle(44, '#ffe680')).setOrigin(0.5);
        const invite = `${location.origin}${location.pathname}?room=${code}`;
        const copyText = this.add.text(640, 450, "Click to copy invite link", textStyle(20, '#cfa8ff'))
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {
                try {
                    await navigator.clipboard.writeText(invite);
                    copyText.setText("Copied! " + invite);
                } catch {
                    copyText.setText(invite);
                }
            });

        if (this.vip) {
            this.startButton = makeButton(this, 640, 600, 360, 70, "Start The Game", () => client.emit("start"));
            this.startButton.setEnabled(false);
        }
        this.hint = this.add.text(640, 670, "", textStyle(20, '#ffffff')).setOrigin(0.5);

        client.on('update players', this.onUpdatePlayers.bind(this));
        client.on('start game', (field) => {
            this.scene.start('MainGame', { field });
        });
        client.on('disconnect', () => {
            if (this.alive) {
                alert("Lost connection to the host.");
                location.reload();
            }
        });
    }

    onUpdatePlayers(data) {
        if (!this.alive) return;
        for (const tag of this.tags) tag.destroy();
        this.tags = data.usernames.map((name, i) =>
            this.add.text(640, 120 + 44 * i, name + (data.vip == name ? '  (host)' : ''),
                textStyle(34, data.vip == name ? '#ff88ff' : '#ffffff')).setOrigin(0.5));

        const count = data.usernames.length;
        const ready = count >= MIN_PLAYERS;
        if (this.vip) {
            this.startButton.setEnabled(ready);
            this.hint.setText(ready
                ? `${count}/5 players. Ready when you are!`
                : `${count}/5 players. Need at least ${MIN_PLAYERS} to start.`);
        } else {
            this.hint.setText(`${count}/5 players. Waiting for the host to start...`);
        }
    }
}

export default Lobby;
