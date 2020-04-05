// Imports
const Character = require("../abstract/Character");

class Tiny extends Character {

    constructor() {
        super("Tiny", ""
            + "All her sisters were\n"
            + "8'9\"");
    }

    /**
     * Activates the cards effects. Activates at the beginning of the user's
     * turn. May have any range of effects.
     */
    activate(field, user) { };

}

// exports the class so it may be imported/required elsewhere
module.exports = Tiny;