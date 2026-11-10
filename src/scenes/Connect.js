import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import { makeButton, makeInput, textStyle, store } from '../classes/UI.js';

/** Title screen: pick a name, then host a room, join one, or play the tutorial */
class Connect extends Phaser.Scene {

    constructor() {
        super("Connect");
    }

    create() {
        this.add.sprite(0, 0, "connectscreen_graphic").setOrigin(0, 0);
        this.add.sprite(640, 150, "title_graphic").setScale(0.42);

        // Room code from an invite link (?room=ABCD)
        const params = new URLSearchParams(window.location.search);
        const inviteCode = (params.get('room') || '').toUpperCase();

        this.add.text(640, 325, "Your name", textStyle(26)).setOrigin(0.5);
        this.nameInput = makeInput(this, 640, 370, 320, {
            value: store.get('sn-username', ''),
            placeholder: 'Mr. E',
        });

        this.hostButton = makeButton(this, 400, 470, 320, 60, "Host a Game", () => this.hostClicked());

        this.add.text(800, 425, "Room code", textStyle(20)).setOrigin(0.5);
        this.codeInput = makeInput(this, 800, 472, 130, {
            value: inviteCode,
            placeholder: 'ABCD',
            maxLength: 4,
        });
        this.codeInput.style.textTransform = 'uppercase';
        this.joinButton = makeButton(this, 960, 470, 140, 60, "Join", () => this.joinClicked());

        this.tutorialButton = makeButton(this, 480, 575, 420, 60, "How to Play (Tutorial)",
            () => this.tutorialClicked(), 0xb36bff);
        this.galleryButton = makeButton(this, 905, 575, 280, 60, "Browse Cards",
            () => this.scene.start('Gallery'), 0xb36bff);

        this.status = this.add.text(640, 660, inviteCode ? `Invited to room ${inviteCode} - enter a name and Join!` : "Needs 4-5 players. One person hosts, the rest join with the room code.",
            textStyle(20, '#ffe680')).setOrigin(0.5);

        // Enter key joins (if a code was entered) or hosts
        const onEnter = (e) => {
            if (e.key != 'Enter') return;
            if (this.codeInput.value.trim()) this.joinClicked();
        };
        this.codeInput.addEventListener('keydown', onEnter);
    }

    getName() {
        const name = this.nameInput.value.trim() || 'Mr. E';
        store.set('sn-username', name);
        return name;
    }

    setBusy(busy, message) {
        for (const b of [this.hostButton, this.joinButton, this.tutorialButton, this.galleryButton]) b.setEnabled(!busy);
        if (message) this.status.setText(message);
    }

    /** Wait for the host to accept us, then go to the lobby */
    awaitAcceptance(nextScene = 'Lobby', data = {}) {
        client.on('accept connection', (playerType) => {
            this.scene.start(nextScene, { vip: playerType == 'vip', ...data });
        });
        client.on('reject connection', (message) => {
            this.setBusy(false, "Couldn't join: " + message);
        });
    }

    async hostClicked() {
        const name = this.getName();
        this.setBusy(true, "Opening a portal...");
        try {
            await client.host(name);
            this.awaitAcceptance();
        } catch (e) {
            console.error(e);
            this.setBusy(false, "Couldn't reach the PeerJS server: " + (e.message || e.type));
        }
    }

    async joinClicked() {
        const name = this.getName();
        const code = this.codeInput.value.trim().toUpperCase();
        if (code.length != 4) {
            this.status.setText("Enter the 4 character room code from your host.");
            return;
        }
        this.setBusy(true, `Joining room ${code}...`);
        try {
            await client.join(name, code);
            this.awaitAcceptance();
        } catch (e) {
            console.error(e);
            this.setBusy(false, e.message);
        }
    }

    tutorialClicked() {
        const name = this.getName();
        client.tutorial(name);
        client.on('accept connection', () => {
            // Start immediately, no lobby needed
            client.on('start game', (field) => {
                this.scene.start('MainGame', { field, tutorial: true });
            });
            client.emit('start');
        });
    }
}

export default Connect;
