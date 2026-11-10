import Phaser from 'phaser';
import client from '../net/SocketClient.js';
import CardSprite from '../classes/CardSprite.js';
import Tutorial from '../classes/Tutorial.js';
import TableFx from '../classes/TableFx.js';
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
        /** How many once-per-turn cards (Bolts) we've played this turn */
        this.playedThisTurn = new Map();
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
        this.fx = new TableFx(this);

        // A faint marker for the "play area" where untargeted cards are dropped
        this.playZone = this.add.rectangle(640, 300, 820, 300, 0x000000, 0.12)
            .setStrokeStyle(2, 0xffffff, 0.15);
        this.playZoneText = this.add.text(640, 430, "drop Fireball / Shield here", textStyle(16, '#ffffffaa')).setOrigin(0.5);

        this.turnText = this.add.text(640, 60, "", textStyle(24, '#ffe680')).setOrigin(0.5);

        // Big announcement text
        this.quickText = this.add.text(640, 170, "", textStyle(32)).setOrigin(0.5).setScale(0).setDepth(75);
        this.quickTextTween = this.tweens.add({
            targets: this.quickText,
            y: 140,
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
            .setStrokeStyle(2, 0xb36bff).setDepth(80).setVisible(false);
        this.tooltipText = this.add.text(640, 300, "", { ...textStyle(20), wordWrap: { width: 360 } })
            .setOrigin(0.5).setDepth(81).setVisible(false);

        client.on('your player', (player) => {
            this.mainPlayer = player;
            const handData = player.hand;
            this.mainPlayer.hand = [];
            delete this.otherPlayers[player.username];
            this.placePlayerSprites();
            this.placeOtherPlayers();
            this.createTurnEndButton();
            for (const card of handData) this.addCard(card);
            if (this.tutorialMode) {
                // The tutorial explains everything itself, so skip the reveal
                client.emit('ready');
                this.tutorial = new Tutorial(this);
            } else {
                this.showSetup();
            }
        });
        client.on('your new card', (card) => this.addCard(card));
        client.on('table settings', ({ cardHold }) => { if (cardHold) this.fx.hold = cardHold; });
        client.on('ready status', (status) => this.onReadyStatus(status));
        client.on('all ready', () => this.hideSetup());
        client.on('turn start', (username) => this.turnChange(username));
        client.on('spell played', this.onSpellPlayed.bind(this));
        client.on('sync', this.checkSync.bind(this));
        client.on('game over', this.gameOver.bind(this));
        client.on('death', (name) => this.fx.whenIdle(() => this.userDie(name)));
        client.on('the gmaster bro reveals himself', this.displayGrandmaster.bind(this));
        // 'risen' arrives just before the card that caused it, so give that
        // card a moment to start flying before showing the result
        client.on('risen', (name) => this.time.delayedCall(100, () => this.fx.whenIdle(() => this.onRisen(name))));
        client.on('you rose', (info) => this.time.delayedCall(100, () => this.fx.whenIdle(() => this.onYouRose(info))));
        client.on('disconnect', () => {
            if (!this.gameIsOver && this.scene.isActive()) {
                this.quickTextDisplay("Lost connection to the host!");
                this.time.delayedCall(2500, () => location.reload());
            }
        });
    }

    /* ---------------------------------------------------------------- */
    /* Pre-game: look at your role and character, then ready up          */
    /* ---------------------------------------------------------------- */

    showSetup() {
        const me = this.mainPlayer;
        const objs = this.setupObjects = [];
        const depth = 70;
        objs.push(this.add.rectangle(640, 300, 820, 380, 0x1a0026, 0.94).setStrokeStyle(3, 0xb36bff).setDepth(depth));
        objs.push(this.add.text(640, 135, "Your cards for this game", textStyle(28, '#ffe680')).setOrigin(0.5).setDepth(depth + 1));

        // Big copies of your role and character
        for (const [card, x] of [[me.role, 340], [me.character, 520]]) {
            const big = new CardSprite(x, 315, card, depth + 1, this, 2.6);
            big.setDraggable(false, true);
            big.specEmitter.on('hover', this.showTooltip, this);
            big.specEmitter.on('unhover', this.hideTooltip, this);
            objs.push(big);
        }

        const goal = {
            Grandmaster: "You're the Grandmaster. Everyone knows it. Find and destroy the Necromancer.",
            Sorcerer: "You're a Sorcerer. Protect the Grandmaster and destroy the Necromancer.",
            Necromancer: "You're the Necromancer. Kill the Grandmaster without getting caught.",
        }[me.role.name] || me.role.description;
        const ch = me.character;
        const text = `${goal}\n\nYou're playing as ${ch.name}.\n${ch.ability}: ${(ch.abilityText || '').replace(/\n/g, ' ')}\n\nHover the other players' cards to see who they're playing as.`;
        objs.push(this.add.text(640, 175, text, { ...textStyle(18), align: 'left', wordWrap: { width: 380 } }).setOrigin(0, 0).setDepth(depth + 1));

        this.readyButton = makeButton(this, 830, 445, 220, 50, "Ready", () => {
            client.emit('ready');
            this.readyButton.setEnabled(false);
            this.readyButton.text.setText("Ready!");
        });
        this.readyButton.setDepth(depth + 2);
        objs.push(this.readyButton.rect, this.readyButton.text);
        this.waitingText = this.add.text(640, 478, "", textStyle(16, '#cfa8ff')).setOrigin(0.5).setDepth(depth + 1);
        objs.push(this.waitingText);
        this.turnText.setText("Look over your cards, then click Ready");
    }

    onReadyStatus({ waiting }) {
        if (!this.waitingText) return;
        const others = waiting.filter((n) => n != this.mainPlayer?.username);
        const meReady = !waiting.includes(this.mainPlayer?.username);
        this.waitingText.setText(others.length ? `Waiting for: ${others.join(', ')}`
            : meReady ? "" : "Everyone else is ready!");
    }

    hideSetup() {
        for (const obj of this.setupObjects || []) obj.destroy();
        this.setupObjects = null;
        this.waitingText = null;
        this.hideTooltip();
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
        if (gm && gm.roleIcon) gm.roleIcon.setTexture("Grandmaster_graphic");
    }

    onSpellPlayed(obj) {
        let message = null;
        if (obj.caster == NECRO_PHASE && obj.cardname == 'Rise From the Dead') {
            message = obj.target == this.mainPlayer.username ? "You rise from the dead!" : `${obj.target} rises from the dead\nto serve the Necromancer!`;
        } else if (obj.caster == NECRO_PHASE) {
            message = `Dark magic! ${obj.cardname}\nstrikes ${obj.target == this.mainPlayer.username ? 'you' : obj.target}!`;
        } else if (obj.caster != this.mainPlayer.username) {
            const who = (name) => name == this.mainPlayer.username ? 'you' : name;
            if (['Shield', 'Robe', 'Wand'].includes(obj.cardname)) message = `${obj.caster} equipped a ${obj.cardname}`;
            else if (obj.target) message = `${obj.caster} cast ${obj.cardname}\non ${who(obj.target)}` + (obj.dodged ? '... dodged!' : '');
            else message = `${obj.caster} cast ${obj.cardname}!`;
        } else if (obj.dodged) {
            message = `${obj.target} dodged your Bolt!`;
        }
        if (message) this.quickTextDisplay(message);

        // Cards come from whoever cast them (the Necromancy phase's dark card
        // sits in the middle of the table)
        const from = obj.caster == NECRO_PHASE ? { x: 640, y: 380 } : this.fx.playerPos(obj.caster);
        this.fx.playCard(obj, from, (play) => {
            this.landEffects(play);
            this.checkSync({ player: null, field: play.field }, true);
        });
        this.notify('spell played', obj);
    }

    /** What happens when a played card reaches its target */
    landEffects(play) {
        const fx = this.fx;
        for (const name of play.saved || []) {
            this.time.delayedCall(250, () => fx.popText(name, 'Nine Lives!', '#ffe680'));
        }
        switch (play.cardname) {
            case 'Bolt':
                if (play.dodged) fx.popText(play.target, 'dodged!', '#a8d8ff');
                else fx.flash(play.target);
                break;
            case 'Fireball':
                fx.shake();
                for (const name of [this.mainPlayer.username, ...Object.keys(this.otherPlayers)]) {
                    const alive = name == this.mainPlayer.username ? !this.dead : this.otherPlayers[name].health > 0;
                    if (name != play.caster && alive) fx.flash(name, 0xff8833);
                }
                break;
            case 'Witch Brew':
                fx.flash(play.target, 0x9b30ff);
                break;
            case 'Rise From the Dead':
                fx.flash(play.target, 0xb38fd9);
                break;
        }
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
            p.seat = { x, y, side };
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
            // Their role, face down (the Grandmaster's gets flipped when revealed)
            p.roleIcon = this.add.sprite(side == 'left' ? tx + 85 : tx - 85, y + 40, "roleback_graphic").setScale(0.6);
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
        const count = (name) => (items || []).filter((i) => i.name == name).length;
        const parts = [];
        if (count('Shield')) parts.push(`-${Math.min(60, count('Shield') * 15)}% dmg`);
        if (count('Robe')) parts.push(`${Math.min(60, count('Robe') * 20)}% dodge`);
        if (count('Wand')) parts.push(`+${count('Wand') * 5} dmg`);
        textObj.setText(parts.join('  '));
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
        if (sprite.card.oncePerTurn) this.playedThisTurn.set(sprite.card.name, (this.playedThisTurn.get(sprite.card.name) || 0) + 1);
        this.notify('card played', { card: sprite.card, targets });
        this.removeCard(sprite.index);
    }

    /** How many of a once-per-turn card we can play (Lilium's Quick Draw) */
    limitFor(card) {
        if (card.name == 'Bolt') return this.mainPlayer.character?.boltsPerTurn ?? 1;
        return 1;
    }

    /** Which living opponent (if any) a card was dropped on */
    opponentUnder(bounds, dead = false) {
        for (const [name, p] of Object.entries(this.otherPlayers)) {
            // Only living players, or only dead ones (for Rise From the Dead)
            if ((p.health > 0) == dead) continue;
            if (Phaser.Geom.Rectangle.Overlaps(bounds, p.charSprite.getBounds())) {
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

        if (card.oncePerTurn && (this.playedThisTurn.get(card.name) || 0) >= this.limitFor(card)) {
            const limit = this.limitFor(card);
            if (sprite.y < PLAY_LINE_Y) this.quickTextDisplay(`Only ${limit == 1 ? 'one' : limit} ${card.name}${limit == 1 ? '' : 's'} per turn!`);
            return done();
        }

        if (card.targetType == 'dead') {
            const target = this.opponentUnder(bounds, true);
            if (!target) {
                if (sprite.y < PLAY_LINE_Y) this.quickTextDisplay("Drop it on a dead player");
                return done();
            }
            if (this.necroCardPlayed) {
                this.quickTextDisplay("Only one dark ritual per turn");
                return done();
            }
            this.necroCardPlayed = true;
            return this.playCard(sprite, target);
        }

        if (card.targetType == 'player') {
            const target = this.opponentUnder(bounds);
            if (!target) return done();
            if (target == this.master) {
                this.quickTextDisplay("You can't Bolt your master!");
                return done();
            }
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
        this.playedThisTurn.clear();
        this.whosTurn = username;
        for (const p of Object.values(this.otherPlayers)) p.highlight?.setVisible(p.username == username);

        if (username == NECRO_PHASE) {
            this.isYourTurn = false;
            this.turnText.setText("Necromancy phase...");
            this.quickTextDisplay("The dead stir...");
            this.showDarkRitual();
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

    /** A face-down dark card drifts onto the table during the Necromancy phase */
    showDarkRitual() {
        const card = this.add.sprite(640, 380, "darkback_graphic").setScale(0).setDepth(40).setAlpha(0);
        this.tweens.add({
            targets: card,
            scale: 2.2,
            alpha: 1,
            angle: 360,
            duration: 700,
            ease: 'Back.easeOut',
            onComplete: () => this.tweens.add({
                targets: card, alpha: 0, delay: 1800, duration: 500,
                onComplete: () => card.destroy(),
            }),
        });
    }

    /** Someone came back as a Thrall */
    onRisen(username) {
        const p = this.otherPlayers[username];
        if (!p) return;
        p.health = 50;
        p.healthText.setText("50/100").setColor('#ffffff');
        p.tint = 0xb38fd9;
        p.charSprite.graphic.setTint(p.tint);
        p.roleIcon?.setTexture("Thrall_graphic");
        this.fx.popText(username, '+50', '#c9a0ff');
        p.usernameText.setColor('#c9a0ff').setText(username + " (thrall)");
    }

    /** We came back as a Thrall */
    onYouRose({ role, necromancer }) {
        const me = this.mainPlayer;
        /** The Necromancer we now serve */
        this.master = necromancer;
        this.dead = false;
        me.health = 50;
        me.role = role;
        me.healthText.setText("50/100").setColor('#c9a0ff');
        me.roleSprite.destroy();
        me.roleSprite = new CardSprite(185, HAND_Y, role, 0, this, 2);
        me.roleSprite.setDraggable(false, true);
        me.roleSprite.specEmitter.on('hover', this.showTooltip, this);
        me.roleSprite.specEmitter.on('unhover', this.hideTooltip, this);
        me.tint = 0xb38fd9;
        me.characterSprite.graphic.setTint(me.tint);
        this.time.delayedCall(2200, () =>
            this.quickTextDisplay(`You serve ${necromancer} now.\nKill the Grandmaster!`));
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
        this.fx.whenIdle(() => this.time.delayedCall(2000, () => {
            this.scene.start("Endingscreen", {
                status: winners.includes(this.mainPlayer.username) ? "won" : "lost",
                winners,
                roles,
                tutorial: this.tutorialMode,
            });
        }));
    }

    userDie(username) {
        if (this.mainPlayer.username == username) {
            this.dead = true;
            this.mainPlayer.health = 0;
            this.mainPlayer.healthText.setText("You Died").setColor('#ff5555');
            this.mainPlayer.tint = 0x555555;
            this.mainPlayer.characterSprite.graphic.setTint(this.mainPlayer.tint);
            this.quickTextDisplay("You have died!");
        } else {
            const p = this.otherPlayers[username];
            if (!p) return;
            this.quickTextDisplay(`${username} has died!`);
            p.health = 0;
            p.healthText.setText("dead").setColor('#ff5555');
            p.tint = 0x555555;
            p.charSprite.graphic.setTint(p.tint);
        }
    }

    /**
     * @param data { field, player } from the host
     * @param {boolean} landing true when a played card just landed
     */
    checkSync(data, landing = false) {
        const fieldPlayers = data.field.players;
        const me = this.mainPlayer;
        if (!me) return;
        // While cards are flying, health and items wait for them to land
        const holdTable = this.fx.busy && !landing;

        // Our own health/items from the field data
        const meOnField = fieldPlayers[me.username];
        if (meOnField && !holdTable) {
            if (meOnField.health != me.health && !this.dead) {
                if (meOnField.health < me.health) this.fx.popText(me.username, `-${me.health - meOnField.health}`);
                me.health = meOnField.health;
                me.healthText.setText(`${Math.max(0, me.health)}/100`);
            }
            this.setDefenseText(me.defenseText, meOnField.items);
            this.fx.renderItems(me.username, me, meOnField.items);
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
            if (truth.hand != p.hand) {
                p.hand = truth.hand;
                p.cardCountText.setText(String(truth.hand));
            }
            if (holdTable) continue;
            if (truth.health != p.health && p.health > 0) {
                if (truth.health < p.health) this.fx.popText(name, `-${p.health - Math.max(0, truth.health)}`);
                p.health = truth.health;
                p.healthText.setText(`${Math.max(0, truth.health)}/100`);
            }
            this.setDefenseText(p.defenseText, truth.items);
            this.fx.renderItems(name, p, truth.items);
        }
    }
}

export default MainGame;
