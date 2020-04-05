const tools = require('../Tools');
const server = require('../SocketServer');
const Player = require('./Player');
const Grandmaster = require('./roles/Grandmaster');
const Necromancer = require('./roles/Necromancer');
const Sorcerer = require('./roles/Sorcerer');
const CharDeck = require('./cards/decks/CharDeck');
const MainDeck = require('./cards/decks/MainDeck');

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

        // Create the player objects
        this.createPlayers(usernames);

    }

    createPlayers(usernames) {
        // Shuffle the users to pick random roles
        tools.shuffle(usernames);
        // Create a grandmaster (if there's at least 4 players)
        if (usernames.length >= 4) {
            let grand = usernames.pop();
            this.players[grand] = new Player(grand, new Grandmaster(), CharDeck.pop(), this);
        }
        // Create a necromancer
        let necro = usernames.pop();
        this.players[necro] = new Player(necro, new Necromancer(), CharDeck.pop(), this);
        // Create a bunch of sorcerers
        for (let name of usernames) {
            this.players[name] = new Player(name, new Sorcerer(), CharDeck.pop(), this);
        }
    }

    dealHands(usernames) {
        for (let name of usernames) {
            let hand = this.players[name].hand;
            for (let i = 0; i < 5; i++) {
                // Draw the card from the deck
                let card = MainDeck.pop();
                // Add the card to the hand
                hand.push(card);
                // Let the client know about the card
                server.emitTo(
                    // Change the id->username map to a username->id map
                    // Then subscript the username to get the id
                    tools.reverseObject(server.usernames)[name],
                    'your new card',
                    card
                )
            }
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
        console.log(""
            + "********************************\n"
            + "********* FIELD STATUS *********\n"
            + "********************************\n");
        for (let ply of Object.values(this.players)) {
            console.log(ply.username);
            console.log("HP:", ply.health);
            console.dir(ply.hand, { depth: 0 });
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