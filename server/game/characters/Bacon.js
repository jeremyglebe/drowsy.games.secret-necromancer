// Imports
const Character = require("./Character")

class Bacon extends Character {
    
    name = "Bacon"
    description = "It is said he looks\n like a peanut";

    constructor(){
        super(Bacon.name, Bacon.description);
    }

    /** Activates the cards effect */
    activate(){}
}

// exports the class so it may be imported/required elsewhere
module.exports = Bacon;