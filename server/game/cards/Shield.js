// Imports
const Card = require("./Card");

class Shield extends Card {

    name = "Shield";
    description = "Basic defense\nBlocks 20 damage";
    targetType = "player"

    constructor(){
        super(Shield.name,Shield.description,Shield.targetType);
    }

    activate(){
        //Here would go an overwritten activate function
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Shield;