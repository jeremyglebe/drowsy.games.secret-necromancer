// Imports
const Character = require("../abstract/Character");

class Bacon extends Character {

    constructor() {
        super("Lord Bacon", ""
            + "It is said he looks\n"
            + "like a peanut");
    }

    /**
     * Activates the cards effects. Activates at the beginning of the user's
     * turn. May have any range of effects.
     */
    activate(field, user) { };

}

// exports the class so it may be imported/required elsewhere
module.exports = Bacon;