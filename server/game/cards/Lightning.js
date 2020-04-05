// Imports
const Card = require("./Card");

class Lightning extends Card {

    name = "Lightning";
    description = "Basic heavy attack\nDoes 35 damage";
    targetType = "player"

    constructor(){
        super(Lightning.name,Lightning.description,Lightning.targetType);
    }

    activate(){
        //Here would go an overwritten activate function
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Lightning;