//imports
const Phaser = require("phaser");

/** 
 * Used to store the client side version of the card, hold all the same
 * data as the server-side version of the card but tacks on the added Phaser
 * objects.
 */

class CardSprite {

    /** Stores the Card passed to it from the server */
    card;
    /** Stores the group of sprites used to visually represent the card class on the client-side */
    graghic;

    /** used to create an instance of the card */
    constructor(card){
        this.card = card;
        constructGraghic();
    }

    /** Used to construct the graghic object or phaser group object upon getting the internal this.card */
    constructGraghic(){
        //will need access to phaser for this
    }

    /** calls to the global socket to emit to the server to active this card */
    active(){

    }
}

// exports the class so it may be imported/required elsewhere
module.exports = CardSprite;