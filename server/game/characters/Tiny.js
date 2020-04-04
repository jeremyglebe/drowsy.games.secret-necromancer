// Imports
const Character = require("./Character")

class Tiny extends Character {
    
    name = "Tiny"
    description = "The names a bit\nironic";

    constructor(){
        super(Tiny.name, Tiny.description);
    }

    /** Activates the cards effect */
    activate(){}
}

// exports the class so it may be imported/required elsewhere
module.exports = Tiny;