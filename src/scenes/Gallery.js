import Phaser from 'phaser';
import CardSprite from '../classes/CardSprite.js';
import { makeButton, textStyle } from '../classes/UI.js';
import Bacon from '../host/cards/characters/Bacon.js';
import Lilium from '../host/cards/characters/Lilium.js';
import Tiny from '../host/cards/characters/Tiny.js';
import Mittens from '../host/cards/characters/Mittens.js';
import Ember from '../host/cards/characters/Ember.js';
import Grandmaster from '../host/roles/Grandmaster.js';
import Sorcerer from '../host/roles/Sorcerer.js';
import Necromancer from '../host/roles/Necromancer.js';
import Thrall from '../host/roles/Thrall.js';
import Bolt from '../host/cards/spells/Bolt.js';
import Fireball from '../host/cards/spells/Fireball.js';
import Shield from '../host/cards/items/Shield.js';
import Robe from '../host/cards/items/Robe.js';
import Wand from '../host/cards/items/Wand.js';
import ForgetfulPotion from '../host/cards/necromancy/ForgetfulPotion.js';
import RiseFromTheDead from '../host/cards/necromancy/RiseFromTheDead.js';

const SCALE = 1.8;
const STEP = 112;

/** Every card in the game, laid out so you can read them before playing */
const SECTIONS = [
    { title: "Characters", y: 235, x: 70, cards: () => [new Bacon(), new Lilium(), new Tiny(), new Mittens(), new Ember()] },
    { title: "Roles", y: 235, x: 700, cards: () => [new Grandmaster(), new Sorcerer(), new Necromancer(), new Thrall()] },
    { title: "Spells & Equipment", y: 510, x: 70, cards: () => [new Bolt(), new Fireball(), new Shield(), new Robe(), new Wand()] },
    { title: "Dark Arts (Necromancer only)", y: 510, x: 700, cards: () => [new ForgetfulPotion(), new RiseFromTheDead()] },
];

class Gallery extends Phaser.Scene {

    constructor() {
        super("Gallery");
    }

    create() {
        CardSprite.anyCardIsEnlarged = false;
        this.add.sprite(0, 0, "gamebackground_graphic").setOrigin(0, 0);
        this.add.text(640, 40, "All the Cards", textStyle(36)).setOrigin(0.5);

        for (const section of SECTIONS) {
            this.add.text(section.x - 20, section.y - 130, section.title, textStyle(22, '#ffe680')).setOrigin(0, 0.5);
            section.cards().forEach((card, i) => {
                const sprite = new CardSprite(section.x + 30 + i * STEP, section.y, card, 1, this, SCALE);
                sprite.setDraggable(false, true);
                sprite.specEmitter.on('hover', this.showInfo, this);
                sprite.specEmitter.on('unhover', this.hideInfo, this);
            });
        }

        // Card details, readable size
        this.infoBg = this.add.rectangle(640, 655, 900, 70, 0x1a0026, 0.9).setStrokeStyle(2, 0xb36bff).setDepth(50);
        this.info = this.add.text(640, 655, "", { ...textStyle(18), wordWrap: { width: 860 } }).setOrigin(0.5).setDepth(51);
        this.hideInfo();

        makeButton(this, 110, 40, 160, 46, "Back", () => this.scene.start("Connect"));
    }

    showInfo(sprite) {
        if (CardSprite.anyCardIsEnlarged) return;
        const c = sprite.card;
        const body = (c.description || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        this.info.setText(`${c.name}: ${body}`);
    }

    hideInfo() {
        this.info.setText("Hover a card to read it. Right-click to make it big.");
    }
}

export default Gallery;
