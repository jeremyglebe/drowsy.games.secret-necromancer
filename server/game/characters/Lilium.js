// Imports
const Character = require("./Character")

class Lilium extends Character {
    
    name = "Lilium"
    description = "It was a name I suppose";

    constructor(){
        super(Lilium.name, Lilium.description);
    }

    /** Activates the cards effect */
    activate(){}
}

// exports the class so it may be imported/required elsewhere
module.exports = Lilium;