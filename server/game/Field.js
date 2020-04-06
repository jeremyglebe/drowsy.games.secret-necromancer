
/**
 *  Events Reference *
 * * * * * * * * * * *
 * 
 *  Server Emits |
 * --------------|
 * 'your new card': sent when a new card is inserted into a player's hand
 *     Sent to: the client who is receiving the new card.
 *     Argument: the card object
 * 
 * 'player new card': sent when a new card is inserted into a player's hand
 *     Sent to: all other clients except the one who receives the new card
 *     Argument: the username of the client receiving the new card
 * 
 * 'spell played': sent after sucessful spell activation server-side
 *     Sent to: all clients
 *     Argument: { 
 *                   field: client safe field object,
 *                   cardname: card that was played
 *               }
 * 
 * 'turn start': sent by the server when a new player turn is starting
 *     Sent to: all clients
 *     Argument: username of the client whose turn is starting
 * 
 *  Server Listens For |
 * --------------------|
 * 'turn end': sent by a client when they've completed their turn
 *     Argument: none
 * 
 * 'play spell': sent by a client when they wish to play a spell card
 *     Argument: object containing the index, card name, and target
 *               {
 *                   index: ...,
 *                   name: ...,
 *                   targets: ...,
 *               }
 */

const tools = require('../Tools');
const server = require('../SocketServer');
const Player = require('./Player');
const Grandmaster = require('./roles/Grandmaster');
const Necromancer = require('./roles/Necromancer');
const Sorcerer = require('./roles/Sorcerer');
const CharDeck = require('./cards/decks/CharDeck');
const MainDeck = require('./cards/decks/MainDeck');
const NecroDeck = require('./cards/decks/NecroDeck');

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
        /** List of cards in the discard pile */
        this.discard = [];
        /** Stores the ready-to-execute necromancy card */
        this.necroCard = null;

        // Create the player objects
        this.createPlayers(Array.from(usernames));

        // Create listeners for the sockets
        this.createSocketListeners(Array.from(usernames));
    }

    /**
     * Creates player objects, assigns roles, and generates a turn queue.
     * @param usernames 
     */
    createPlayers(usernames) {
        // Generate a random turn queue
        this.turnQueue = Array.from(usernames);
        this.turnQueue.push('##NECRO##');
        tools.shuffle(this.turnQueue);

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

    createSocketListeners(usernames) {
        for (let name of usernames) {
            // For each username, get the associated id
            let id = tools.reverseObject(server.usernames)[name];
            // For each id, add all necessary listeners
            server.sockets[id].on('play spell', (spellInfo) => {
                this.onPlaySpell(server.sockets[id], spellInfo);
            });
            server.sockets[id].on('turn end', () => {
                this.onTurnEnd(server.sockets[id]);
            });
        }
    }

    doNecromancy() {
        if (this.necroCard) {
            this.necroCard.activate(this);
            // Tell all players that a card was played
            server.emit('spell played', {
                field: this.getCliField(),
                cardname: this.necroCard.name,
                target: "necro"
            });
        }
        this.necroCard = null;
        setTimeout(this.nextTurn.bind(this), 5000);
    }

    /** Deal 5 cards from main deck to each of the players */
    dealHands(usernames) {
        for (let name of usernames) {
            for (let i = 0; i < 5; i++) {
                this.sendCard(name);
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
                for (let card of ply.hand) {
                    if (card.type == 'necromancy') {
                        cliPly['hand']--;
                    }
                }
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

    onPlaySpell(socket, spellInfo) {
        // Extract spell information
        let index = spellInfo.index;
        let name = spellInfo.name;
        let targets = spellInfo.targets;
        // Change id->names map to names->id map
        let nameToID = tools.reverseObject(server.usernames);
        // Get id associated with the current player's username
        let currentPlayerID = nameToID[this.turnQueue[0]];
        // Make sure that it is actually the player whose turn it is
        if (socket.id == currentPlayerID) {
            // Get a reference to the player
            let player = this.players[this.turnQueue[0]];
            // Confirm the card names match at the given index
            if (name == player.hand[index].name) {
                // Store the card
                let card = player.hand[index];
                if (card.type == 'necromancy') {
                    if (player.role.name == 'Necromancer' && !this.necroCard) {
                        this.necroCard = card;
                        this.necroCard.target = targets;
                        // Remove the card from the player's hand
                        player.hand.splice(index, 1);
                    }
                } else {
                    // Activate the spell
                    card.activate(this, player.username, targets);
                    // Remove the card from the player's hand
                    player.hand.splice(index, 1);
                    // Add card to the discard pile
                    this.discard.push(card);
                    // Tell all players that a card was played
                    server.emit('spell played', {
                        field: this.getCliField(),
                        cardname: name,
                        target: targets
                    });
                }
            }
        }
    }

    onTurnEnd(socket) {
        // Change id->names map to names->id map
        let nameToID = tools.reverseObject(server.usernames);
        // Get id associated with the current player's username
        let currentPlayerID = nameToID[this.turnQueue[0]];
        // Make sure that it is actually the player whose turn it is
        if (socket.id == currentPlayerID) {
            // Go to the next turn
            this.nextTurn();
        }
    }

    /**
     * Sends card to player with the specified username
     * @param username
     */
    sendCard(username) {
        // Get the player's hand array
        let hand = this.players[username].hand;
        // Draw the card from the deck
        let card = MainDeck.pop();
        // Add the card to the hand
        hand.push(card);
        // Let the client know about the card
        server.emitTo(
            // Change the id->username map to a username->id map
            // Then subscript the username to get the id
            tools.reverseObject(server.usernames)[username],
            'your new card',
            card
        );
        // Let everyone else know that the player has gained a card
        server.emitExcept(
            tools.reverseObject(server.usernames)[username],
            'player new card', username
        );
    }

    sendNecromancy(username) {
        // Get the player's hand array
        let hand = this.players[username].hand;
        // Draw the card from the deck
        let card = NecroDeck.pop();
        // Add the card to the hand
        hand.push(card);
        // Let the client know about the card
        server.emitTo(
            // Change the id->username map to a username->id map
            // Then subscript the username to get the id
            tools.reverseObject(server.usernames)[username],
            'your new card',
            card
        );
    }

    /**
     * Moves the item at the front of the turnQueue to the back.
     */
    nextTurn() {
        // Dequeue the first item in the turn queue
        let first = this.turnQueue.shift();
        // Push first to now be the last element
        this.turnQueue.push(first);
        if (this.turnQueue[0] != '##NECRO##') {
            // Let the clients know a new turn has started
            server.emit('turn start', this.turnQueue[0]);
            // The person whose turn it now is draws a card
            this.sendCard(this.turnQueue[0]);
            if (this.players[this.turnQueue[0]].role.name == 'Necromancer') {
                console.log("Send the necromancer a card")
                this.sendNecromancy(this.turnQueue[0]);
            }
        } else {
            // If it's the necromancy phase, do some necromancy!
            this.doNecromancy();
        }
    }
}

module.exports = Field;