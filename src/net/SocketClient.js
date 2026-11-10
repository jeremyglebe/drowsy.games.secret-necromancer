import { createLocalPair } from './Endpoint.js';
import { hostRoom, joinRoom } from './Peer.js';
import HostServer from '../host/HostServer.js';
import Bot from '../bots/Bot.js';
import { settings, cycle } from './Settings.js';

const BOT_NAMES = ['Merlina', 'Hexley', 'Grimsby', 'Morwen', 'Thistle', 'Quillon', 'Ashgrave', 'Bramble'];

/**
 * The client's connection to the game host. Every player (including the host
 * themself) talks to the HostServer through this same API, so the scenes don't
 * care whether they're hosting or joining.
 */
class SocketClient {
    /** @type {import('./Endpoint.js').default | null} */
    static socket = null;
    /** Room code of the current game */
    static roomCode = null;
    /** The HostServer instance, only set if this client is hosting */
    static server = null;
    /** Bots this host has added to the lobby, by name */
    static bots = new Map();

    /**
     * Opens a room on the PeerJS signalling server, starts a HostServer in
     * this browser tab, and connects to it locally.
     * @param {string} username
     * @returns {Promise<string>} the room code
     */
    static async host(username) {
        const server = new HostServer();
        server.tableSettings = { cardHold: settings.cardHold };
        const { code, peer } = await hostRoom((endpoint, meta) => {
            server.addSocket(endpoint, meta.username);
        });
        server.peer = peer;
        const [serverSide, clientSide] = createLocalPair(false, true);
        this.server = server;
        this.socket = clientSide;
        this.roomCode = code;
        server.addSocket(serverSide, username);
        return code;
    }

    /**
     * Starts an offline tutorial game against three bots. The player is a
     * Sorcerer, goes first, and starts with one of each kind of card.
     * @param {string} username
     */
    static tutorial(username) {
        const bots = ['Merlina', 'Hexley', 'Grimsby'].map((n) => n == username ? n + '?' : n);
        const grandmaster = bots[0];
        const necromancer = bots[1 + Math.floor(Math.random() * 2)];
        const roles = { [username]: 'Sorcerer' };
        for (const b of bots) {
            roles[b] = b == grandmaster ? 'Grandmaster' : b == necromancer ? 'Necromancer' : 'Sorcerer';
        }
        const server = new HostServer({
            roles,
            turnOrder: [username, ...bots],
            startingHands: { [username]: ['Bolt', 'Fireball', 'Shield', 'Bolt', 'Bolt'] },
        });
        server.tableSettings = { cardHold: settings.cardHold };
        const [serverSide, clientSide] = createLocalPair(false, true);
        this.server = server;
        this.socket = clientSide;
        this.roomCode = null;
        server.addSocket(serverSide, username);
        for (const name of bots) {
            const [botServerSide, botClientSide] = createLocalPair(false, true);
            server.addSocket(botServerSide, name);
            this.bots.set(name, { endpoint: botClientSide, bot: new Bot(botClientSide, { delay: settings.botDelay }) });
        }
    }

    /**
     * Adds a bot player to the lobby (host only). The bot runs in this tab.
     * @returns {string|null} the bot's name, or null if there's no room
     */
    static addBot() {
        if (!this.server) return null;
        const taken = this.server.usernames;
        if (taken.length >= 5) return null;
        const name = BOT_NAMES.find((n) => !taken.includes(n));
        const [serverSide, clientSide] = createLocalPair(false, true);
        this.server.addSocket(serverSide, name, { bot: true });
        this.bots.set(name, { endpoint: clientSide, bot: new Bot(clientSide, { delay: settings.botDelay }) });
        return name;
    }

    /** Removes a bot from the lobby (host only) */
    static removeBot(name) {
        const entry = this.bots.get(name);
        if (entry) {
            entry.endpoint.close();
            this.bots.delete(name);
        }
    }

    /**
     * Host only: changes a table setting ('botSpeed' or 'cardPause'). Bots
     * pick up the new speed right away; the card pause goes out to everyone
     * when the game starts.
     * @returns {string} the new value
     */
    static cycleSetting(key) {
        const value = cycle(key);
        for (const { bot } of this.bots.values()) bot.delay = settings.botDelay;
        if (this.server) this.server.tableSettings = { cardHold: settings.cardHold };
        return value;
    }

    /**
     * Joins an existing room by code.
     * @param {string} username
     * @param {string} code
     */
    static async join(username, code) {
        this.socket = await joinRoom(code, { username });
        this.roomCode = code.trim().toUpperCase();
    }

    /**
     * Sends a message and data argument to the host
     * @param {string} key
     * @param {any} data
     */
    static emit(key, data) {
        if (this.socket) {
            this.socket.emit(key, data);
        }
    }

    /**
     * Listens for an event from the host and executes a function on event.
     * @param {string} key
     * @param {function} callback
     */
    static on(key, callback) {
        if (this.socket) {
            this.socket.on(key, callback);
        }
    }
}

export default SocketClient;
