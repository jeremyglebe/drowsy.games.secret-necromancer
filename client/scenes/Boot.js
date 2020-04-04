//imports
const Phaser = require("phaser");

/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

class boot extends Phaser.Scene {

    fireball;

    constructor(){
        super("boot")
    }

    preload(){
        this.load.image("Fireball_graphic", "../assets/images/cards/fireball_card.png");
        this.load.image("Lightning_graphic", "../assets/images/cards/lightning_card.png");
        this.load.image("Shield_graphic", "../assets/images/cards/shield_card.png");
    }

    init(){}

    create(){
        this.scene.start("cardtest");
    }
 }

 // exports the class so it may be imported/required elsewhere
module.exports = boot;