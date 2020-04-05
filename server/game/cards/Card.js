/** Is used to keep track of basic data about a card on the server's end */

class Card {

    /** Used both as the name of the card and as the card graghic key for the client */
    name;
    /** Holds a string Description of the card's activate function/ what the card does */
    description;
    /** Tells who all this card can target, valid values are: self, player ,others ,all */
    targetType;

    constructor(name,description,targetType){
        this.name = name;
        this.description = description;
        this.targetType = targetType;
    }

    /** Activates the cards effect */
    activate(){};

}

// exports the class so it may be imported/required elsewhere
module.exports = Card;