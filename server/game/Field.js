const Player = require('./Player');

class Field {

    /**
     * Constructs a field object, creates Players out of the usernames given,
     * creates decks of cards.
     * @param {array} usernames is a list of all the users who need a Player
     * class instantiated at the start
     */
    constructor(usernames) {
        /** Turn order queue */
        this.turnQueue = [];
        /** Map of usernames to Player objects */
        this.players = [];
        /** List of cards in the deck */
        this.deck = [];
        /** List of cards in the dark arts deck */
        this.dadeck = [];

        // Shuffle the users to pick random roles
        shuffle(usernames);
        // Create a grandmaster (if there's at least 4 players)
        if (usernames.length >= 4) {
            let grand = usernames.pop();
            this.players[grand] = new Player(grand, 'grandmaster', this);
        }
        // Create a necromancer
        let necro = usernames.pop();
        this.players[necro] = new Player(necro, 'necromancer', this);
        // Create a bunch of sorcerers
        for (let name of usernames) {
            this.players[name] = new Player(name, 'sorcerer', this);
        }
    }

    /**
     * Moves the item at the front of the turnQueue to the back.
     */
    nextTurn() {
        // Dequeue from the end of the queue
        let first = this.turnQueue.shift();
        // Push first to now be the last element
        this.turnQueue.push(first);
    }
}

/**
 * Credit for shuffle function to:
 * https://javascript.info/task/shuffle
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = Field;