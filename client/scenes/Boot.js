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
        this.load.image("Bolt_graphic", "../assets/images/cards/lightning_card.png");
        this.load.image("Shield_graphic", "../assets/images/cards/shield_card.png");
        this.load.image("Grandmaster_graphic", "../assets/images/cards/grandmaster_card.png");
        this.load.image("Necromancer_graphic", "../assets/images/cards/necromancer_card.png");
        this.load.image("Sorcerer_graphic", "../assets/images/cards/wizard_card.png");
        this.load.image("Tiny_graphic", "../assets/images/cards/tiny_card.png");
        this.load.image("Lord Bacon_graphic", "../assets/images/cards/bacon_card.png");
        this.load.image("Lilium_graphic", "../assets/images/cards/lilium_card.png");
        this.load.image("backofspell_graphic", "../assets/images/cards/light_card_back.png");
        this.load.image("lobby_graphic","../assets/images/backgrounds/lobby.png")
        this.load.image("gamebackground_graphic","../assets/images/backgrounds/main_screen_2.png")
        this.load.image( "connectscreen_graphic","../assets/images/backgrounds/portal_2.png")
    }

    init() { }

    create() {
        this.scene.start("Connect");
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Boot;