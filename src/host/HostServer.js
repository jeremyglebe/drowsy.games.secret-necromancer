/**
 * The game "server", now running inside the host player's browser tab.
 * Players connect over PeerJS data channels (or a local loopback for the host
 * themself); everything is trust based.
 *
 *  Events Reference *
 * * * * * * * * * * *
 *
 *  Host Emits |
 * ------------|
 * 'accept connection': 'vip' or 'player' (to the joining client)
 * 'reject connection': rejection message (to the joining client)
 * 'update players': { usernames: string[], vip: string } (to all, in lobby)
 * 'table settings': { cardHold } display settings from the host (to all)
 * 'start game': client-safe field (to all)
 * 'your player': the client's full Player object (to each client)
 * 'the gmaster bro reveals himself': username of the Grandmaster (to all)
 * 'sync': { field, player } (to each client, periodically)
 * 'death': username (to all)
 * 'game over': { winners: string[], roles: {username: roleName} } (to all)
 * 'risen': username raised from the dead as a Thrall (to all)
 * 'you rose': { role, necromancer } (to the raised player only)
 *
 *  Host Listens For |
 * ------------------|
 * 'start': from the VIP when they want to start the game
 * 'play spell' / 'turn end': see Field.js
 */

import Field from './Field.js';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 5;

export default class HostServer {

    /**
     * @param {object} options passed through to Field (e.g. roles, delays)
     */
    constructor(options = {}) {
        this.options = options;
        /** Display settings the host picked, sent to everyone at the start */
        this.tableSettings = {};
        /** Map of socket id -> { id, username, endpoint } */
        this.sockets = {};
        this.nextId = 1;
        /** Socket ID of the VIP (first player, i.e. the host) */
        this.vip = null;
        /** Are we still in the lobby? */
        this.lobby = true;
        /** @type {Field|null} */
        this.field = null;
        this.deadPeople = [];
        this.syncTimer = null;
    }

    /* ---------------------------------------------------------------- */
    /* Messaging helpers                                                 */
    /* ---------------------------------------------------------------- */

    get usernames() {
        return Object.values(this.sockets).map((s) => s.username);
    }

    socketFor(username) {
        return Object.values(this.sockets).find((s) => s.username == username);
    }

    emit(key, data) {
        for (const s of Object.values(this.sockets)) s.endpoint.emit(key, data);
    }

    emitToUser(username, key, data) {
        const s = this.socketFor(username);
        if (s) s.endpoint.emit(key, data);
    }

    emitExceptUser(username, key, data) {
        for (const s of Object.values(this.sockets)) {
            if (s.username != username) s.endpoint.emit(key, data);
        }
    }

    /* ---------------------------------------------------------------- */
    /* Lobby                                                             */
    /* ---------------------------------------------------------------- */

    /**
     * Called for each new connection (remote peer or local loopback).
     * @param endpoint an Endpoint with emit/on/close
     * @param {string} username the player's requested username
     * @param {object} [info] extra details, e.g. { bot: true }
     */
    addSocket(endpoint, username, info = {}) {
        username = String(username || '').trim().slice(0, 16);
        const reject = this.rejectionReason(username);
        if (reject) {
            endpoint.emit('reject connection', reject);
            // Give the message a moment to arrive before hanging up
            setTimeout(() => endpoint.close && endpoint.close(), 500);
            return;
        }

        const socket = { id: this.nextId++, username, endpoint, bot: !!info.bot };
        this.sockets[socket.id] = socket;
        if (this.vip == null) this.vip = socket.id;

        endpoint.emit('accept connection', socket.id == this.vip ? 'vip' : 'player');
        this.broadcastPlayers();

        endpoint.on('disconnect', () => this.onDisconnect(socket));
        endpoint.on('start', () => this.onStart(socket));
        endpoint.on('play spell', (info) => {
            if (this.field && this.field.onPlaySpell(socket.username, info)) {
                this.update();
            }
        });
        endpoint.on('turn end', () => {
            if (this.field) this.field.onTurnEnd(socket.username);
        });
    }

    rejectionReason(username) {
        if (!username) return 'Please enter a username.';
        if (username == '##NECRO##') return 'Nice try, Necromancer.';
        if (!this.lobby) return 'That game has already started.';
        if (Object.keys(this.sockets).length >= MAX_PLAYERS) return 'That room is full.';
        if (this.usernames.includes(username)) return 'Username is already in use.';
        return null;
    }

    broadcastPlayers() {
        if (!this.lobby) return;
        this.emit('update players', {
            usernames: this.usernames,
            vip: this.sockets[this.vip]?.username,
            bots: Object.values(this.sockets).filter((s) => s.bot).map((s) => s.username),
        });
    }

    onDisconnect(socket) {
        if (!this.sockets[socket.id]) return;
        delete this.sockets[socket.id];
        if (this.lobby) {
            this.broadcastPlayers();
        } else if (this.field && !this.field.over) {
            // A player who leaves mid-game is treated as dead so play continues
            const player = this.field.players[socket.username];
            if (player && player.health > 0) {
                player.health = 0;
                this.update();
            }
        }
    }

    onStart(socket) {
        const count = Object.keys(this.sockets).length;
        if (socket.id == this.vip && this.lobby && count >= MIN_PLAYERS) {
            this.lobby = false;
            this.startMatch();
        }
    }

    /* ---------------------------------------------------------------- */
    /* Play                                                              */
    /* ---------------------------------------------------------------- */

    startMatch() {
        this.field = new Field(this.usernames, this, this.options);
        const field = this.field;

        this.emit('table settings', this.tableSettings);
        this.emit('start game', field.getCliField());
        for (const s of Object.values(this.sockets)) {
            s.endpoint.emit('your player', field.players[s.username]);
        }
        field.dealHands();
        const gm = field.findRole('Grandmaster');
        if (gm) this.emit('the gmaster bro reveals himself', gm);
        // The first nextTurn() rotates, so start "before" the first player
        field.turnQueue.unshift(field.turnQueue.pop());
        field.nextTurn();

        // Periodic sync keeps clients honest about hand/health state
        this.syncTimer = setInterval(() => this.sync(), 1000);
    }

    sync() {
        if (!this.field) return;
        const cliField = this.field.getCliField();
        for (const s of Object.values(this.sockets)) {
            s.endpoint.emit('sync', {
                field: cliField,
                player: this.field.players[s.username],
            });
        }
    }

    /** Checks for deaths and victory after anything happens. */
    update() {
        const field = this.field;
        if (!field || field.over) return;

        for (const [name, player] of Object.entries(field.players)) {
            if (player.health <= 0 && !this.deadPeople.includes(name)) {
                player.health = 0;
                this.deadPeople.push(name);
                this.emit('death', name);
            }
        }

        const necromancer = field.findRole('Necromancer');
        const grandmaster = field.findRole('Grandmaster');
        const evil = Object.keys(field.players).filter((n) =>
            ['Necromancer', 'Thrall'].includes(field.players[n].role.name));
        let winners = null;
        if (field.players[necromancer].health <= 0) {
            winners = Object.keys(field.players).filter((n) => !evil.includes(n));
        } else if (grandmaster && field.players[grandmaster].health <= 0) {
            winners = evil;
        }

        this.sync();

        if (winners) {
            field.over = true;
            clearInterval(this.syncTimer);
            const roles = {};
            for (const [name, player] of Object.entries(field.players)) {
                roles[name] = player.role.name;
            }
            this.emit('game over', { winners, roles });
            return;
        }

        // Remove the dead from the turn order (may start the next turn)
        for (const name of this.deadPeople) {
            field.removeFromQueue(name);
        }
    }

    /** Called by the Field when Rise From the Dead brings someone back */
    onRaised(username) {
        this.deadPeople = this.deadPeople.filter((n) => n != username);
        this.emit('risen', username);
        // The thrall learns their new role, and who they now serve
        this.emitToUser(username, 'you rose', {
            role: this.field.players[username].role,
            necromancer: this.field.findRole('Necromancer'),
        });
    }

    /** Shuts down the host (stops timers and the PeerJS listener). */
    destroy() {
        clearInterval(this.syncTimer);
        if (this.field) this.field.over = true;
        if (this.peer) this.peer.destroy();
    }
}
