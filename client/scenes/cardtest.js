//imports
const CardSprite = require("../classes/CardSprite");

/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

class CardTest extends Phaser.Scene {

    fireball;

    constructor() {
        super("cardtest")
    }

    preload() { }

    init() { }

    create() {
        let test = new CardSprite("", this);
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = CardTest;