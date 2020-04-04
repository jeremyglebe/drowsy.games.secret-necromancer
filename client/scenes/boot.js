/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

class CardTest extends Phaser.Scene {

    fireball;

    constructor(){
        super("cardtest")
    }

    preload(){
        this.load.image("fireball", "../assets/images/cards/fireball_card.png");
        this.load.image("lightning", "../assets/images/cards/lightning_card.png");
    }

    init(){}

    create(){}
 }

 // exports the class so it may be imported/required elsewhere
module.exports = CardTest;