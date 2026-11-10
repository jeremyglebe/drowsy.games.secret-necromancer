import { Peer } from 'peerjs';
import Endpoint from './Endpoint.js';

/**
 * Prefix for PeerJS ids so our short room codes don't collide with other apps
 * using the free public PeerJS signalling server.
 */
const ID_PREFIX = 'secret-necromancer-v1-';
/** Room code alphabet, no easily-confused characters */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 4) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
}

function wrapConnection(conn, buffer) {
    const endpoint = new Endpoint((msg) => {
        if (conn.open) conn.send(msg);
    }, buffer);
    conn.on('data', (msg) => endpoint._receive(msg));
    conn.on('close', () => endpoint._closed());
    conn.on('error', () => endpoint._closed());
    endpoint.close = () => conn.close();
    return endpoint;
}

/**
 * Registers as a host with the PeerJS signalling server under a random room
 * code. `onConnection(endpoint, metadata)` is called for every peer that
 * connects. Resolves with `{ code, peer }` once the room is open.
 */
export function hostRoom(onConnection) {
    return new Promise((resolve, reject) => {
        const attempt = (triesLeft) => {
            const code = randomCode();
            const peer = new Peer(ID_PREFIX + code);
            let opened = false;
            peer.on('open', () => {
                opened = true;
                resolve({ code, peer });
            });
            peer.on('connection', (conn) => {
                conn.on('open', () => {
                    // Host side does not buffer: the host registers its
                    // listeners synchronously on connection.
                    onConnection(wrapConnection(conn, false), conn.metadata || {});
                });
            });
            peer.on('error', (err) => {
                if (!opened && err.type === 'unavailable-id' && triesLeft > 0) {
                    peer.destroy();
                    attempt(triesLeft - 1);
                } else if (!opened) {
                    peer.destroy();
                    reject(err);
                } else {
                    console.warn('PeerJS error (host):', err);
                }
            });
            // If the signalling server drops us, try to reconnect so new
            // players can still join. Existing connections are unaffected.
            peer.on('disconnected', () => {
                if (!peer.destroyed) peer.reconnect();
            });
        };
        attempt(5);
    });
}

/**
 * Connects to a host by room code. Resolves with an Endpoint once the data
 * channel is open.
 */
export function joinRoom(code, metadata) {
    return new Promise((resolve, reject) => {
        const peer = new Peer();
        let settled = false;
        const fail = (message) => {
            if (settled) return;
            settled = true;
            peer.destroy();
            reject(new Error(message));
        };
        peer.on('open', () => {
            const conn = peer.connect(ID_PREFIX + code.trim().toUpperCase(), {
                metadata,
                serialization: 'json',
                reliable: true,
            });
            conn.on('open', () => {
                if (settled) return;
                settled = true;
                resolve(wrapConnection(conn, true));
            });
        });
        peer.on('error', (err) => {
            if (err.type === 'peer-unavailable') fail('Room not found. Check the code.');
            else fail('Connection error: ' + (err.message || err.type));
        });
        setTimeout(() => fail('Timed out connecting to room.'), 15000);
    });
}
