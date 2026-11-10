import Card from './Card.js';

export default class Character extends Card {
    constructor(name, description) {
        super(name, description);
        this.type = 'character';
    }

    /** Activates at the beginning of the user's turn (no characters use this yet) */
    activate(field, user) { }
}
