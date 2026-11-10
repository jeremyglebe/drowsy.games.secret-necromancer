import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import { makeButton, textStyle } from '../classes/UI.js';
import { settings } from '../net/Settings.js';

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
            this.botButton = makeButton(this, 470, 600, 260, 70, "Add Bot", () => client.addBot(), 0xb36bff);
            this.startButton = makeButton(this, 810, 600, 340, 70, "Start The Game", () => client.emit("start"));
            this.startButton.setEnabled(false);

            // Table settings: how fast bots play, how long cards linger
            const label = (key) => key == 'botSpeed' ? `Bot speed: ${settings.botSpeed}` : `Card pause: ${settings.cardPause}`;
            for (const [key, x] of [['botSpeed', 470], ['cardPause', 810]]) {
                const button = makeButton(this, x, 525, 300, 44, label(key), () => {
                    client.cycleSetting(key);
                    button.text.setText(label(key));
                }, 0x8899aa);
            }
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
        const bots = data.bots || [];
        this.tags = data.usernames.map((name, i) => {
            const isBot = bots.includes(name);
            const label = name + (data.vip == name ? '  (host)' : isBot ? '  (bot)' : '');
            const tag = this.add.text(640, 120 + 44 * i, label,
                textStyle(34, data.vip == name ? '#ff88ff' : isBot ? '#a8d8ff' : '#ffffff')).setOrigin(0.5);
            // The host can click a bot to send it home
            if (this.vip && isBot) {
                tag.setInteractive({ useHandCursor: true }).on('pointerdown', () => client.removeBot(name));
            }
            return tag;
        });

        const count = data.usernames.length;
        const ready = count >= MIN_PLAYERS;
        if (this.vip) {
            this.startButton.setEnabled(ready);
            this.botButton.setEnabled(count < 5);
            this.hint.setText(ready
                ? `${count}/5 players. Ready when you are!` + (bots.length ? ' (click a bot to remove it)' : '')
                : `${count}/5 players. Need at least ${MIN_PLAYERS} to start. Add bots to fill seats.`);
        } else {
            this.hint.setText(`${count}/5 players. Waiting for the host to start...`);
        }
    }
}

export default Lobby;
