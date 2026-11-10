import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import CardSprite from '../classes/CardSprite.js';
import Tutorial from '../classes/Tutorial.js';
import { makeButton, textStyle } from '../classes/UI.js';

const NECRO_PHASE = '##NECRO##';
/** Cards released above this line count as "played into the middle" */
const PLAY_LINE_Y = 470;
const HAND_Y = 620;

/** Where each opponent sits: [card x, card y, side] */
const SEATS = [
    [80, 110, 'left'],
    [1200, 110, 'right'],
    [80, 330, 'left'],
    [1200, 330, 'right'],
];

class MainGame extends Phaser.Scene {

    constructor() {
        super("MainGame");
    }

    init(data) {
        /**
         * Map of usernames to client-safe player info. Our own player is
         * removed once we know who we are.
         */
        this.otherPlayers = data.field.players;
        this.tutorialMode = !!data.tutorial;
        /** Card sprites in our hand */
        this.hand = [];
        /** Whether we already queued a necromancy card this turn */
        this.necroCardPlayed = false;
        this.isYourTurn = false;
        this.whosTurn = "";
        this.dead = false;
        this.grandmaster = null;
        this.gameIsOver = false;
        CardSprite.anyCardIsEnlarged = false;
        CardSprite.dragging = false;
    }

    create() {
        this.add.sprite(0, 0, "gamebackground_graphic").setOrigin(0, 0);

        // A faint marker for the "play area" where untargeted cards are dropped
        this.playZone = this.add.rectangle(640, 300, 820, 300, 0x000000, 0.12)
            .setStrokeStyle(2, 0xffffff, 0.15);
        this.playZoneText = this.add.text(640, 430, "drop Fireball / Shield here", textStyle(16, '#ffffffaa')).setOrigin(0.5);

        this.turnText = this.add.text(640, 60, "", textStyle(24, '#ffe680')).setOrigin(0.5);

        // Big announcement text
        this.quickText = this.add.text(640, 220, "", textStyle(46)).setOrigin(0.5).setScale(0).setDepth(75);
        this.quickTextTween = this.tweens.add({
            targets: this.quickText,
            y: 180,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            hold: 1200,
            yoyo: true,
            paused: true,
            persist: true,
        });

        // Hover tooltip for reading cards
        this.tooltipBg = this.add.rectangle(640, 300, 380, 150, 0x1a0026, 0.9)
            .setStrokeStyle(2, 0xb36bff).setDepth(60).setVisible(false);
        this.tooltipText = this.add.text(640, 300, "", { ...textStyle(20), wordWrap: { width: 360 } })
            .setOrigin(0.5).setDepth(61).setVisible(false);

        client.on('your player', (player) => {
            this.mainPlayer = player;
            const handData = player.hand;
            this.mainPlayer.hand = [];
            delete this.otherPlayers[player.username];
            this.placePlayerSprites();
            this.placeOtherPlayers();
            this.createTurnEndButton();
            for (const card of handData) this.addCard(card);
            if (this.tutorialMode) this.tutorial = new Tutorial(this);
        });
        client.on('your new card', (card) => this.addCard(card));
        client.on('turn start', (username) => this.turnChange(username));
        client.on('spell played', this.onSpellPlayed.bind(this));
        client.on('sync', this.checkSync.bind(this));
        client.on('game over', this.gameOver.bind(this));
        client.on('death', this.userDie.bind(this));
        client.on('the gmaster bro reveals himself', this.displayGrandmaster.bind(this));
        client.on('disconnect', () => {
            if (!this.gameIsOver && this.scene.isActive()) {
                this.quickTextDisplay("Lost connection to the host!");
                this.time.delayedCall(2500, () => location.reload());
            }
        });
    }

    /** Lets the tutorial (if any) know what's happening */
    notify(event, payload) {
        this.events.emit('tut', event, payload);
    }

    displayGrandmaster(username) {
        this.grandmaster = username;
        const label = username == this.mainPlayer?.username ? "You are the Grandmaster!" : "The Grandmaster is: " + username;
        this.add.text(640, 22, label, textStyle(30)).setOrigin(0.5);
        const gm = this.otherPlayers[username];
        if (gm && gm.usernameText) gm.usernameText.setColor('#ff88ff').setText(username + " (GM)");
    }

    onSpellPlayed(obj) {
        let message = null;
        if (obj.caster == NECRO_PHASE) {
            message = `Dark magic! ${obj.cardname}\nstrikes ${obj.target == this.mainPlayer.username ? 'you' : obj.target}!`;
        } else if (obj.caster != this.mainPlayer.username) {
            if (obj.cardname == 'Shield') message = `${obj.caster} equipped a Shield`;
            else if (obj.target) message = `${obj.caster} cast ${obj.cardname}\non ${obj.target == this.mainPlayer.username ? 'you' : obj.target}`;
            else message = `${obj.caster} cast ${obj.cardname}!`;
        }
        if (message) this.quickTextDisplay(message);
        this.checkSync({ player: null, field: obj.field });
        this.notify('spell played', obj);
    }

    placePlayerSprites() {
        const me = this.mainPlayer;
        me.characterSprite = new CardSprite(70, HAND_Y, me.character, 0, this, 2);
        me.characterSprite.setDraggable(false, true);
        me.roleSprite = new CardSprite(185, HAND_Y, me.role, 0, this, 2);
        me.roleSprite.setDraggable(false, true);
        for (const s of [me.characterSprite, me.roleSprite]) {
            s.specEmitter.on('hover', this.showTooltip, this);
            s.specEmitter.on('unhover', this.hideTooltip, this);
        }
        this.add.text(70, 515, me.username, textStyle(20)).setOrigin(0.5);
        this.add.text(185, 515, "your secret role", textStyle(14, '#ffe680')).setOrigin(0.5);

        me.healthText = this.add.text(1160, 545, `${me.health}/100`, textStyle(34)).setOrigin(0.5);
        me.defenseText = this.add.text(1160, 590, "", textStyle(18, '#a8d8ff')).setOrigin(0.5);
    }

    placeOtherPlayers() {
        const style = textStyle(20);
        Object.keys(this.otherPlayers).forEach((name, i) => {
            const p = this.otherPlayers[name];
            const [x, y, side] = SEATS[i];
            const tx = side == 'left' ? x + 55 : x - 55;
            const ox = side == 'left' ? 0 : 1;
            p.charSprite = new CardSprite(x, y, p.character, 0, this, 1.5);
            p.charSprite.setDraggable(false, true);
            p.charSprite.specEmitter.on('hover', this.showTooltip, this);
            p.charSprite.specEmitter.on('unhover', this.hideTooltip, this);
            p.usernameText = this.add.text(tx, y - 60, p.username, style).setOrigin(ox, 0);
            p.healthText = this.add.text(tx, y - 32, `${p.health}/100`, style).setOrigin(ox, 0);
            p.defenseText = this.add.text(tx, y - 6, "", textStyle(16, '#a8d8ff')).setOrigin(ox, 0);
            p.cardCountIcon = this.add.sprite(side == 'left' ? tx + 15 : tx - 15, y + 40, "backofspell_graphic").setScale(0.6);
            p.cardCountText = this.add.text(side == 'left' ? tx + 35 : tx - 35, y + 30, String(p.hand), style).setOrigin(ox, 0);
            p.highlight = this.add.rectangle(x, y, 90, 138).setStrokeStyle(4, 0xffe680).setVisible(false);
        });
    }

    showTooltip(cardSprite) {
        if (CardSprite.dragging || CardSprite.anyCardIsEnlarged) return;
        const c = cardSprite.card;
        let body = (c.description || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        if (c.type == 'necromancy') body += "\n(Secret! Only you can see this card.)";
        this.tooltipText.setText(`${c.name}\n\n${body}\n\n(right-click to enlarge)`);
        this.tooltipBg.setSize(380, this.tooltipText.height + 30);
        this.tooltipBg.setVisible(true);
        this.tooltipText.setVisible(true);
    }

    hideTooltip() {
        this.tooltipBg.setVisible(false);
        this.tooltipText.setVisible(false);
    }

    placeHand() {
        const n = this.hand.length;
        const left = 330, right = 1040;
        const step = n > 1 ? Math.min(115, (right - left) / (n - 1)) : 0;
        for (let i = 0; i < n; i++) {
            const card = this.hand[i];
            card.index = i;
            card.setDepth(10 + i);
            if (!card.large) card.move(left + step * i, HAND_Y);
            card.setDefaultPos(left + step * i, HAND_Y);
        }
    }

    setDefenseText(textObj, items) {
        const def = Math.min(60, (items || []).length * 15);
        textObj.setText(def ? `Shield: -${def}% dmg` : "");
    }

    removeCard(index = 0) {
        this.mainPlayer.hand.splice(index, 1);
        const [sprite] = this.hand.splice(index, 1);
        sprite.destroy();
        this.placeHand();
    }

    addCard(card) {
        this.mainPlayer.hand.push(card);
        const sprite = new CardSprite(640, HAND_Y, card, 10, this, 2);
        sprite.specEmitter.on("cardDragEnd", this.checkOverlapTarget, this);
        sprite.specEmitter.on('hover', this.showTooltip, this);
        sprite.specEmitter.on('unhover', this.hideTooltip, this);
        this.hand.push(sprite);
        this.placeHand();
    }

    /** Sends a play to the host and removes the card locally */
    playCard(sprite, targets) {
        client.emit('play spell', {
            index: sprite.index,
            name: sprite.card.name,
            targets,
        });
        this.notify('card played', { card: sprite.card, targets });
        this.removeCard(sprite.index);
    }

    /** Which living opponent (if any) a card was dropped on */
    opponentUnder(bounds) {
        for (const [name, p] of Object.entries(this.otherPlayers)) {
            if (p.health > 0 && Phaser.Geom.Rectangle.Overlaps(bounds, p.charSprite.getBounds())) {
                return name;
            }
        }
        return null;
    }

    checkOverlapTarget(bounds, sprite) {
        const card = sprite.card;
        const done = () => sprite.restoreDefaultPos();

        if (!this.isYourTurn) {
            // Only complain if they actually dragged it somewhere
            if (sprite.y < PLAY_LINE_Y) this.quickTextDisplay(this.dead ? "You're dead..." : "Wait for your turn!");
            return done();
        }

        if (card.targetType == 'player') {
            const target = this.opponentUnder(bounds);
            if (!target) return done();
            if (card.type == 'necromancy') {
                if (this.necroCardPlayed) {
                    this.quickTextDisplay("Only one dark ritual per turn");
                    return done();
                }
                this.necroCardPlayed = true;
            }
            return this.playCard(sprite, target);
        }

        if (card.targetType == 'self') {
            const onMe = Phaser.Geom.Rectangle.Overlaps(bounds, this.mainPlayer.characterSprite.getBounds());
            if (onMe || sprite.y < PLAY_LINE_Y) return this.playCard(sprite, this.mainPlayer.username);
            return done();
        }

        if (card.targetType == 'others' || card.targetType == 'all') {
            if (sprite.y < PLAY_LINE_Y) return this.playCard(sprite, null);
            return done();
        }

        done();
    }

    createTurnEndButton() {
        this.turnEndButton = makeButton(this, 1160, 665, 200, 56, "End Turn", () => this.turnEnd());
        this.turnEndButton.setVisible(false);
    }

    turnChange(username) {
        this.necroCardPlayed = false;
        this.whosTurn = username;
        for (const p of Object.values(this.otherPlayers)) p.highlight?.setVisible(p.username == username);

        if (username == NECRO_PHASE) {
            this.isYourTurn = false;
            this.turnText.setText("Necromancy phase...");
            this.quickTextDisplay("The dead stir...");
        } else if (username == this.mainPlayer.username) {
            this.isYourTurn = true;
            this.turnText.setText("Your turn! Drag cards to play them.");
            this.quickTextDisplay("It's your turn!");
            this.turnEndButton.setVisible(true);
        } else {
            this.isYourTurn = false;
            this.turnText.setText(`${username}'s turn`);
            this.quickTextDisplay(`It's ${username}'s turn!`);
            this.turnEndButton.setVisible(false);
        }
        this.notify('turn start', username);
    }

    turnEnd() {
        if (!this.isYourTurn) return;
        this.isYourTurn = false;
        this.turnEndButton.setVisible(false);
        client.emit("turn end");
        this.notify('turn end');
    }

    quickTextDisplay(string) {
        this.quickText.setText(string);
        if (this.quickTextTween.isPlaying()) {
            this.quickTextTween.restart();
        } else {
            this.quickTextTween.play();
        }
    }

    gameOver({ winners, roles }) {
        if (this.gameIsOver) return;
        this.gameIsOver = true;
        this.isYourTurn = false;
        this.time.delayedCall(2000, () => {
            this.scene.start("Endingscreen", {
                status: winners.includes(this.mainPlayer.username) ? "won" : "lost",
                winners,
                roles,
                tutorial: this.tutorialMode,
            });
        });
    }

    userDie(username) {
        if (this.mainPlayer.username == username) {
            this.dead = true;
            this.mainPlayer.health = 0;
            this.mainPlayer.healthText.setText("You Died").setColor('#ff5555');
            this.quickTextDisplay("You have died!");
        } else {
            const p = this.otherPlayers[username];
            if (!p) return;
            this.quickTextDisplay(`${username} has died!`);
            p.health = 0;
            p.healthText.setText("dead").setColor('#ff5555');
            p.charSprite.graphic.setTint(0x555555);
        }
    }

    checkSync(data) {
        const fieldPlayers = data.field.players;
        const me = this.mainPlayer;
        if (!me) return;

        // Our own health/items from the field data
        const meOnField = fieldPlayers[me.username];
        if (meOnField) {
            if (meOnField.health != me.health && !this.dead) {
                me.health = meOnField.health;
                me.healthText.setText(`${Math.max(0, me.health)}/100`);
            }
            this.setDefenseText(me.defenseText, meOnField.items);
        }

        // Our hand: only the full player object from 'sync' has it
        if (data.player && !CardSprite.dragging && !CardSprite.anyCardIsEnlarged) {
            const truth = data.player.hand;
            const mine = me.hand;
            const bad = truth.length != mine.length || truth.some((c, i) => c.name != mine[i].name);
            if (bad) {
                for (const sprite of this.hand) sprite.destroy();
                this.hand = [];
                me.hand = [];
                for (const card of truth) this.addCard(card);
            }
        }

        // Everyone else
        for (const [name, p] of Object.entries(this.otherPlayers)) {
            const truth = fieldPlayers[name];
            if (!truth) continue;
            if (truth.health != p.health && p.health > 0) {
                p.health = truth.health;
                p.healthText.setText(`${Math.max(0, truth.health)}/100`);
            }
            if (truth.hand != p.hand) {
                p.hand = truth.hand;
                p.cardCountText.setText(String(truth.hand));
            }
            this.setDefenseText(p.defenseText, truth.items);
        }
    }
}

export default MainGame;
