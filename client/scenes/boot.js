//imports
const Phaser = require("phaser");

/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

class boot extends Phaser.Scene {

    fireball;

    constructor(){
        super("Boot")
    }

    preload(){
        this.load.image("Fireball_graphic", "../assets/images/cards/fireball_card.png");
        this.load.image("Lightning_graphic", "../assets/images/cards/lightning_card.png");
        this.load.image("Shield_graphic", "../assets/images/cards/shield_card.png");
        this.load.image("Grandmaster_graphic", "../assets/images/cards/grandmaster_card.png");
        this.load.image("Necromancer_graphic", "../assets/images/cards/necromancer_card.png");
        this.load.image("Wizard_graphic", "../assets/images/cards/wizard_card.png");
    }

    init(){}

    create(){
        this.scene.start("Maingame");
    }
 }

 // exports the class so it may be imported/required elsewhere
module.exports = boot;