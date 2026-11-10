import Card from './Card.js';

export default class Item extends Card {
    constructor(name, description) {
        super(name, description);
        this.type = 'item';
        this.targetType = 'self';
    }

    /** Modifies the user's stats. Called any time the user's stats are calculated. */
    activate(user) { }
}
