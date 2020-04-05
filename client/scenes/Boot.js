//imports
const Phaser = require("phaser");

/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

class Boot extends Phaser.Scene {

    fireball;

    constructor() {
        super("Boot")
    }

    preload() {
        this.load.image("Fireball_graphic", "../assets/images/cards/fireball_card.png");
        this.load.image("Lightning_graphic", "../assets/images/cards/lightning_card.png");
        this.load.image("Shield_graphic", "../assets/images/cards/shield_card.png");
        this.load.image("Grandmaster_graphic", "../assets/images/cards/grandmaster_card.png");
        this.load.image("Necromancer_graphic", "../assets/images/cards/necromancer_card.png");
        this.load.image("Wizard_graphic", "../assets/images/cards/wizard_card.png");
        this.load.image("Tiny_graphic", "../assets/images/cards/tiny_card.png");
        this.load.image("Bacon_graphic", "../assets/images/cards/bacon_card.png");
        this.load.image("Lilium_graphic", "../assets/images/cards/lilium_card.png");
        this.load.image("backofspell_graphic", "../assets/images/cards/light_card_back.png");
    }

    init() { }

    create() {
        this.scene.start("Connect");
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Boot;