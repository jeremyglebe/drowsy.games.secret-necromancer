// Imports
const Card = require("./Card");

class Fireball extends Card {

    name = "Fireball";
    description = "Basic attack\nDoes 20 damage";
    targetType = "player"

    constructor(){
        super(Fireball.name,Fireball.description,Fireball.targetType);
    }

    activate(){
        //Here would go an overwritten activate function
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Fireball;