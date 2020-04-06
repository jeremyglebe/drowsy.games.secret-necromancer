const Card = require('./Card');

class Spell extends Card {

    constructor(name, description, targetType) {
        super(name, description)
        /**
         * Tells who all this card can target. Since targets are passed
         * directly into activate(), this is really for the client. It lets the
         * client know how they should handle playing the card visually. You
         * would need to select a target in game if the spell targets one
         * player, for instance. Whereas a spell that targets all would just be
         * clicked.
         * Acceptable values are the following strings:
         * 'self', 'player', 'others', 'all'
         */
        this.targetType = targetType;
        this.type = 'spell';
    }

    /** Activates the cards effect */
    activate(field, caster, targets) { };

}

module.exports = Spell;