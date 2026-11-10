import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import { makeButton, textStyle } from '../classes/UI.js';

class Endingscreen extends Phaser.Scene {

    constructor() {
        super("Endingscreen");
    }

    init(data) {
        this.status = data.status;
        this.winners = data.winners || [];
        this.roles = data.roles || {};
        this.tutorial = !!data.tutorial;
    }

    create() {
        this.add.sprite(0, 0, "endingscreen_graphic").setOrigin(0, 0);
        this.add.sprite(640, 110, "title_graphic").setScale(0.3);

        const won = this.status == "won";
        this.add.text(640, 260, won ? "You've won!" : "Game Over!", textStyle(64, won ? '#7dff7d' : '#ff7d7d')).setOrigin(0.5);

        const necro = Object.keys(this.roles).find((n) => this.roles[n] == 'Necromancer');
        const necroWon = this.winners.includes(necro);
        this.add.text(640, 340, necroWon ? "The Necromancer triumphs..." : "The Necromancer has been destroyed!",
            textStyle(32, '#ffe680')).setOrigin(0.5);

        // Reveal everyone's secret role
        const lines = Object.entries(this.roles).map(([name, role]) =>
            `${this.winners.includes(name) ? '★' : ' '} ${name}: ${role}`);
        this.add.text(640, 470, "Roles revealed:\n" + lines.join('\n'), {
            ...textStyle(26),
            fontFamily: 'monospace',
            align: 'left',
        }).setOrigin(0.5);

        makeButton(this, 640, 650, 380, 60, this.tutorial ? "Back to Title" : "Play Again", () => {
            if (client.server) client.server.destroy();
            // Simplest way to fully reset networking + scenes. Keep ?room
            // out so players don't auto-fill an old code.
            location.href = location.pathname;
        });
    }
}

export default Endingscreen;
