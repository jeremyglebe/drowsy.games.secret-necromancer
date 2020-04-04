class Player {
    /** A number between 1 & 100 representing the health of the player */
    health;
    /**
     * Stats of the player. Recalculated when used, these members are for
     * temporary storage during calculation.
     */
    defense;
    evasion;
    focus;
    /**
     * List of cards in the player's hand.
     * @type {array}
     */
    hand;
    /**
     * List of dark arts cards in the player's hand (if they're a necromancer)
     * @type {array}
     */
    dahand;
    /**
     * Username of the player. Field stores players in an object keyed by
     * username, so this is mostly for rare instances of reverse-lookup.
     */
    username;
    /**
     * Role of the user is what "team" they're on and what information other
     * players know (or don't know) about them.
     * Grandmasters & Sorcerers are fighting Necromancers. Grandmasters are
     * known to everyone else, but whether another player is a Sorcerer or a
     * Necromancer is a complete mystery.
     */
    role;

    /**
     * Create a Player with the given username and role. Draw their cards from
     * the decks inside of the field argument.
     * @param {string} username 
     * @param {string} role 
     * @param {any} field
     */
    constructor(username, role, field) {
        this.username = username;
        this.role = role;
        this.health = 100;
        this.defense = 0;
        this.evasion = 0;
        this.focus = 0;
        for (let i = 0; i < 5; i++)
            this.drawFrom(field.deck);
        // If the player is a necromancer, draw dark arts
        if (this.role == 'necromancer') {
            for (let i = 0; i < 3; i++)
                this.drawFrom(field.dadeck);
        }
    }

    /**
     * Draws a card from a deck and puts it into the player's hand.
     * @param {array} deck 
     */
    drawFrom(deck) {
        let card = deck.pop();
        if (!card.evil)
            this.hand.push(card);
        else if (this.role == 'necromancer') {
            this.dahand.push(card);
        } else {
            console.log("You can't have an evil card! You're a ", this.role, '!');
        }
    }
}

module.exports = Player;