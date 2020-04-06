const Card = require('./Card');

class Character extends Card {

    constructor(name, description) {
        super(name, description)
        this.type = 'character';
    }

    /**
     * Activates the cards effects. Activates at the beginning of the user's
     * turn. May have any range of effects.
     */
    activate(field, user) { };

}

module.exports = Character;