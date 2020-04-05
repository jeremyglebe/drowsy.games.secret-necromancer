const tools = require('../Tools');
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
        this.players = {};
        /** List of cards in the deck */
        this.deck = [];

        // Shuffle the users to pick random roles
        tools.shuffle(usernames);
        // Create a grandmaster (if there's at least 4 players)
        if (usernames.length >= 4) {
            let grand = usernames.pop();
            this.players[grand] = new Player(grand, 'grandmaster', null, this);
        }
        // Create a necromancer
        let necro = usernames.pop();
        this.players[necro] = new Player(necro, 'necromancer', null, this);
        // Create a bunch of sorcerers
        for (let name of usernames) {
            this.players[name] = new Player(name, 'sorcerer', null, this);
        }
    }

    /**
     * Generates and returns a client-safe version of the field object with
     * hidden information (such as the roles of the players) removed from the
     * object.
     */
    getCliField() {
        // Create the client's field object
        let cliField = {
            players: {}
        }
        for (let plyKey of Object.keys(this.players)) {
            let ply = this.players[plyKey];
            // Create an empty object to copy player data into
            let cliPly = {};
            // Copy every key except role into cliPly
            for (let key in ply) {
                if (key != 'role' && key != 'hand') {
                    cliPly[key] = ply[key];
                }
                cliPly['hand'] = ply['hand'].length;
            }
            // Add cliPly to new fields list of players
            cliField.players[plyKey] = cliPly;
        }
        return cliField;
    }

    /**
     * Prints status and info about the field
     */
    print() {
        console.log(this.players);
        console.log(""
            + "********************************\n"
            + "********* FIELD STATUS *********\n"
            + "********************************\n");
        for (let ply of Object.values(this.players)) {
            console.log(ply.username);
            console.log("HP:", ply.health);
            console.log("Hand:", ply.hand, '\n');
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

module.exports = Field;