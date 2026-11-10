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
import HealingPotion from '../host/cards/spells/HealingPotion.js';
import Freeze from '../host/cards/spells/Freeze.js';
import ManaCrystal from '../host/cards/spells/ManaCrystal.js';
import Loot from '../host/cards/spells/Loot.js';
import EldritchHorror from '../host/cards/necromancy/EldritchHorror.js';
import ForgetfulPotion from '../host/cards/necromancy/ForgetfulPotion.js';
import RaiseDead from '../host/cards/necromancy/RaiseDead.js';

const SCALE = 1.45;
const STEP = 92;

/** Every card in the game, laid out so you can read them before playing */
const SECTIONS = [
    { title: "Characters", y: 170, x: 70, cards: () => [new Bacon(), new Lilium(), new Tiny(), new Mittens(), new Ember()] },
    { title: "Roles", y: 170, x: 700, cards: () => [new Grandmaster(), new Sorcerer(), new Necromancer(), new Thrall()] },
    { title: "Spells", y: 380, x: 70, cards: () => [new Bolt(), new Fireball(), new HealingPotion(), new Freeze(), new ManaCrystal(), new Loot()] },
    { title: "Equipment", y: 590, x: 70, cards: () => [new Shield(), new Robe(), new Wand()] },
    { title: "Dark Arts (Necromancer only)", y: 590, x: 700, cards: () => [new ForgetfulPotion(), new RaiseDead(), new EldritchHorror()] },
];

class Gallery extends Phaser.Scene {

    constructor() {
        super("Gallery");
    }

    create() {
        CardSprite.anyCardIsEnlarged = false;
        // The first version of the portal from the jam, finally getting used
        this.add.sprite(0, 0, "gallery_graphic").setOrigin(0, 0);
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.35);
        this.add.text(640, 34, "All the Cards", textStyle(34)).setOrigin(0.5);

        for (const section of SECTIONS) {
            this.add.text(section.x - 20, section.y - 92, section.title, textStyle(20, '#ffe680')).setOrigin(0, 0.5);
            section.cards().forEach((card, i) => {
                const sprite = new CardSprite(section.x + 30 + i * STEP, section.y, card, 1, this, SCALE);
                sprite.setDraggable(false, true);
                sprite.specEmitter.on('hover', this.showInfo, this);
                sprite.specEmitter.on('unhover', this.hideInfo, this);
                // The enlarged card covers the info bar, so get it out of the way
                sprite.specEmitter.on('enlarge', () => this.setInfoVisible(false));
                sprite.specEmitter.on('shrink', () => this.setInfoVisible(true));
            });
        }

        // Card details, readable size
        this.infoBg = this.add.rectangle(640, 690, 1100, 44, 0x1a0026, 0.9).setStrokeStyle(2, 0xb36bff).setDepth(50);
        this.info = this.add.text(640, 690, "", { ...textStyle(17), wordWrap: { width: 1080 } }).setOrigin(0.5).setDepth(51);
        this.hideInfo();

        makeButton(this, 100, 34, 140, 44, "Back", () => this.scene.start("Connect"));
    }

    setInfoVisible(visible) {
        this.infoBg.setVisible(visible);
        this.info.setVisible(visible);
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
