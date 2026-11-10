/**
 *  Events Reference *
 * * * * * * * * * * *
 *
 *  Host Emits |
 * ------------|
 * 'your new card': a new card was inserted into a player's hand
 *     Sent to: the player receiving the card. Argument: the card object
 *
 * 'player new card': a new card was inserted into a player's hand
 *     Sent to: everyone else. Argument: username receiving the card
 *
 * 'spell played': a spell was successfully activated
 *     Sent to: all. Argument: { field, cardname, caster, target }
 *
 * 'turn start': a new turn is starting
 *     Sent to: all. Argument: username whose turn it is, or '##NECRO##' for
 *     the necromancy phase
 *
 *  Host Listens For (routed by HostServer) |
 * -----------------------------------------|
 * 'turn end': the current player is done
 * 'play spell': { index, name, targets }
 */

import { shuffle } from './Tools.js';
import Player from './Player.js';
import Grandmaster from './roles/Grandmaster.js';
import Necromancer from './roles/Necromancer.js';
import Sorcerer from './roles/Sorcerer.js';
import Thrall from './roles/Thrall.js';
import CharDeck from './cards/decks/CharDeck.js';
import MainDeck from './cards/decks/MainDeck.js';
import NecroDeck from './cards/decks/NecroDeck.js';

export const NECRO_PHASE = '##NECRO##';

export default class Field {

    /**
     * @param {string[]} usernames all players in the game
     * @param {object} server object providing emit / emitToUser / emitExceptUser
     * @param {object} options { necroPhaseDelay: ms to linger on necro phase }
     */
    constructor(usernames, server, options = {}) {
        this.server = server;
        this.necroPhaseDelay = options.necroPhaseDelay ?? 4000;
        /** Turn order queue, front is the current turn */
        this.turnQueue = [];
        /** Map of usernames to Player objects */
        this.players = {};
        /** Discard pile (main deck cards only) */
        this.discard = [];
        /** The ready-to-execute necromancy card */
        this.necroCard = null;
        /** Set when the game has ended, stops all further turns */
        this.over = false;
        /** How many of each once-per-turn card were played this turn */
        this.playedThisTurn = new Map();

        this.charDeck = CharDeck();
        this.mainDeck = MainDeck();
        this.necroDeck = NecroDeck();

        this.createPlayers(Array.from(usernames), options.roles);
        // Optional fixed turn order (used by the tutorial)
        if (options.turnOrder) this.turnQueue = [...options.turnOrder, NECRO_PHASE];
        /** Optional map of username -> card names to deal them first */
        this.startingHands = options.startingHands || {};
    }

    /**
     * Creates player objects, assigns roles, and generates a turn queue.
     * @param {string[]} usernames
     * @param {object} [forcedRoles] optional map of username -> role name
     */
    createPlayers(usernames, forcedRoles) {
        this.turnQueue = shuffle([...usernames, NECRO_PHASE]);

        if (forcedRoles) {
            const roleClasses = { Grandmaster, Necromancer, Sorcerer };
            for (const name of usernames) {
                const Role = roleClasses[forcedRoles[name] || 'Sorcerer'];
                this.players[name] = new Player(name, new Role(), this.charDeck.pop());
            }
            return;
        }

        shuffle(usernames);
        // A Grandmaster (if there's at least 4 players)
        if (usernames.length >= 4) {
            const grand = usernames.pop();
            this.players[grand] = new Player(grand, new Grandmaster(), this.charDeck.pop());
        }
        // A Necromancer
        const necro = usernames.pop();
        this.players[necro] = new Player(necro, new Necromancer(), this.charDeck.pop());
        // Everyone else is a Sorcerer
        for (const name of usernames) {
            this.players[name] = new Player(name, new Sorcerer(), this.charDeck.pop());
        }
    }

    get currentTurn() {
        return this.turnQueue[0];
    }

    findRole(roleName) {
        for (const [name, player] of Object.entries(this.players)) {
            if (player.role.name == roleName) return name;
        }
        return null;
    }

    /** Deal 5 cards from the main deck to each player */
    dealHands() {
        for (const name of Object.keys(this.players)) {
            // Pull any rigged starting cards to the top of the deck first
            for (const cardName of (this.startingHands[name] || []).slice().reverse()) {
                const i = this.mainDeck.findIndex((c) => c.name == cardName);
                if (i >= 0) this.mainDeck.push(...this.mainDeck.splice(i, 1));
            }
            for (let i = 0; i < 5; i++) {
                this.sendCard(name);
            }
        }
    }

    /**
     * A client-safe version of the field with hidden information (roles,
     * hand contents, necromancy cards) removed.
     */
    getCliField() {
        const cliField = { players: {} };
        for (const [name, ply] of Object.entries(this.players)) {
            const cliPly = {};
            for (const key in ply) {
                if (key != 'role' && key != 'hand') cliPly[key] = ply[key];
            }
            cliPly.hand = ply.hand.filter((c) => c.type != 'necromancy').length;
            cliField.players[name] = cliPly;
        }
        return cliField;
    }

    discardCard(card) {
        // Necromancy cards go back to the void, not the main discard pile
        if (card && card.type != 'necromancy') this.discard.push(card);
    }

    /**
     * Handles a 'play spell' request from a player.
     * @returns {boolean} whether the play was accepted
     */
    onPlaySpell(username, spellInfo) {
        if (this.over || username != this.currentTurn) return false;
        const { index, name, targets } = spellInfo || {};
        const player = this.players[username];
        const card = player.hand[index];
        if (!card || card.name != name) return false;

        if (card.type == 'necromancy') {
            if (player.role.name != 'Necromancer' || this.necroCard) return false;
            const victim = this.players[targets];
            if (!victim) return false;
            // Raise Dead needs a corpse; everything else needs someone alive
            if ((card.targetType == 'dead') != (victim.health <= 0)) return false;
            if (card.targetType == 'dead' && victim.role.name == 'Necromancer') return false;
            player.hand.splice(index, 1);
            this.necroCard = card;
            this.necroCard.target = targets;
            return true;
        }

        if (card.oncePerTurn && (this.playedThisTurn.get(card.name) || 0) >= this.limitFor(player, card)) return false;

        let result = {};
        if (card.type == 'item') {
            player.hand.splice(index, 1);
            player.items.push(card);
            player.calcStats();
        } else {
            if (card.targetType == 'player') {
                const target = this.players[targets];
                if (!target || target.health <= 0) return false;
                // A Thrall can't Bolt their master (a Fireball is another story)
                if (player.role.name == 'Thrall' && target.role.name == 'Necromancer') return false;
            }
            result = card.activate(this, username, targets) || {};
            if (card.oncePerTurn) this.playedThisTurn.set(card.name, (this.playedThisTurn.get(card.name) || 0) + 1);
            player.hand.splice(index, 1);
            this.discardCard(card);
        }

        this.server.emit('spell played', {
            field: this.getCliField(),
            cardname: name,
            description: card.description,
            caster: username,
            target: card.targetType == 'player' ? targets : null,
            ...result,
            saved: this.collectSaves(),
        });
        return true;
    }

    onTurnEnd(username) {
        if (!this.over && username == this.currentTurn) {
            this.nextTurn();
        }
    }

    drawMain() {
        if (this.mainDeck.length == 0) {
            // Reshuffle the discard pile into a new deck
            this.mainDeck = shuffle(this.discard);
            this.discard = [];
        }
        return this.mainDeck.pop();
    }

    /** Draws a card from the main deck into a player's hand */
    sendCard(username) {
        const card = this.drawMain();
        if (!card) return;
        this.players[username].hand.push(card);
        this.server.emitToUser(username, 'your new card', card);
        this.server.emitExceptUser(username, 'player new card', username);
    }

    /** Draws a necromancy card into a player's hand (secretly) */
    sendNecromancy(username) {
        if (this.necroDeck.length == 0) this.necroDeck = NecroDeck();
        const card = this.necroDeck.pop();
        this.players[username].hand.push(card);
        this.server.emitToUser(username, 'your new card', card);
    }

    doNecromancy() {
        if (this.necroCard) {
            this.necroCard.activate(this);
            this.server.emit('spell played', {
                field: this.getCliField(),
                cardname: this.necroCard.name,
                description: this.necroCard.description,
                caster: NECRO_PHASE,
                target: this.necroCard.target,
                saved: this.collectSaves(),
            });
        }
        this.necroCard = null;
        setTimeout(() => this.nextTurn(), this.necroPhaseDelay);
    }

    /** How many of a once-per-turn card this player may play (Lilium gets 2 Bolts) */
    limitFor(player, card) {
        if (card.name == 'Bolt') return player.character?.boltsPerTurn ?? 1;
        return 1;
    }

    /** Names of anyone Nine Lives just saved (and forget about it) */
    collectSaves() {
        const saved = [];
        for (const [name, player] of Object.entries(this.players)) {
            if (player.justSaved) {
                saved.push(name);
                delete player.justSaved;
            }
        }
        return saved;
    }

    /**
     * Brings a dead player back as the Necromancer's thrall. They rejoin the
     * turn order just before the Necromancy phase.
     */
    raise(username) {
        const player = this.players[username];
        if (!player || player.health > 0) return;
        player.health = 50;
        player.role = new Thrall();
        this.turnQueue.splice(this.turnQueue.indexOf(NECRO_PHASE), 0, username);
        this.server.onRaised?.(username);
    }

    /** Moves the front of the turn queue to the back and starts the next turn. */
    nextTurn() {
        if (this.over) return;
        this.turnQueue.push(this.turnQueue.shift());
        this.startTurn();
    }

    /** Starts the turn of whoever is at the front of the queue. */
    startTurn() {
        if (this.over) return;
        const current = this.currentTurn;
        this.playedThisTurn.clear();
        this.server.emit('turn start', current);
        if (current == NECRO_PHASE) {
            this.doNecromancy();
            return;
        }
        // Lord Bacon's Old Money draws extra
        const draws = this.players[current].character?.drawsPerTurn ?? 1;
        for (let i = 0; i < draws; i++) this.sendCard(current);
        if (this.players[current].role.name == 'Necromancer') {
            this.sendNecromancy(current);
        }
    }

    /**
     * Removes a dead player from the turn order. If it was their turn, the
     * next player's turn begins.
     */
    removeFromQueue(username) {
        const index = this.turnQueue.indexOf(username);
        if (index < 0) return;
        this.turnQueue.splice(index, 1);
        if (index == 0) this.startTurn();
    }
}
