import Card from './Card.js';

export default class Spell extends Card {
    constructor(name, description, targetType) {
        super(name, description);
        /**
         * Tells the client how to play the card visually.
         * Acceptable values: 'self', 'player', 'others', 'all'
         */
        this.targetType = targetType;
        this.type = 'spell';
    }

    activate(field, caster, targets) { }
}
