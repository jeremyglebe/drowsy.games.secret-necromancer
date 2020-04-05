/** Is used to keep track of basic data about a card on the server's end */

class Card {

    constructor(name, description) {
        /** Used both as the name of the card and as the card graghic key for the client */
        this.name = name;
        /** Holds a string Description of the card's activate function/ what the card does */
        this.description = description;
    }

    /** Activates the cards effect */
    activate() { };

}

// exports the class so it may be imported/required elsewhere
module.exports = Card;