class Player {
    /**
     * Create a Player with the given username and role. Draw their cards from
     * the decks inside of the field argument.
     * @param {string} username 
     * @param {string} role 
     * @param {any} field
     */
    constructor(username, role, character, field) {
        /**
         * Username of the player. Field stores players in an object keyed by
         * username, so this is mostly for rare instances of reverse-lookup.
         */
        this.username = username;
        /**
         * Role of the user is what "team" they're on and what information other
         * players know (or don't know) about them.
         * Grandmasters & Sorcerers are fighting Necromancers. Grandmasters are
         * known to everyone else, but whether another player is a Sorcerer or a
         * Necromancer is a complete mystery.
         */
        this.role = role;
        /** Used to store what character the player is */
        this.character = character;
        /** A number between 1 & 100 representing the health of the player */
        this.health = 100;
        /**
         * Stats of the player. Recalculated when used, these members are for
         * temporary storage during calculation.
         */
        this.defense = 0;
        this.evasion = 0;
        this.focus = 0;
        /** List of cards in the player's hand. */
        this.hand = [];
        /** List of dark arts cards in the player's hand (if they're a necromancer) */
        this.dahand = [];
        // Draw 5 random cards
        // for (let i = 0; i < 5; i++)
        //     this.drawFrom(field.deck);
        // If the player is a necromancer, draw dark arts
        // if (this.role == 'necromancer') {
        //     for (let i = 0; i < 3; i++)
        //         this.drawFrom(field.dadeck);
        // }
    }

    /**
     * Draws a card from a deck and puts it into the player's hand.
     * @param {array} deck 
     */
    drawFrom(deck) {
        let card = deck.pop();
        if (card) {
            if (!card.evil)
                this.hand.push(card);
            else if (this.role == 'necromancer') {
                this.dahand.push(card);
            } else {
                console.log("You can't have an evil card! You're a ", this.role, '!');
            }
        } else {
            console.log("Deck is empty :(");
        }
    }
}

module.exports = Player;