/**
 * A message endpoint with a socket.io-like API: `emit(key, data)` and
 * `on(key, callback)`. Messages travel as `{ k: key, d: data }` envelopes
 * over whatever transport is plugged in via `send`.
 *
 * Messages that arrive before anyone listens for their key are buffered and
 * delivered (in order) as soon as a listener registers. This avoids races
 * where, e.g., the host sends 'your player' before the MainGame scene has
 * finished starting and registered its listeners.
 */
export default class Endpoint {
    /**
     * @param {(msg: {k: string, d: any}) => void} send transport send function
     * @param {boolean} buffer whether to buffer messages with no listener
     */
    constructor(send, buffer = true) {
        this._send = send;
        this._buffer = buffer;
        this._handlers = new Map();
        this._pending = new Map();
        this.closed = false;
    }

    emit(key, data) {
        if (this.closed) return;
        this._send({ k: key, d: data });
    }

    on(key, callback) {
        if (!this._handlers.has(key)) this._handlers.set(key, []);
        this._handlers.get(key).push(callback);
        // Flush anything that arrived before we were listening
        const pending = this._pending.get(key);
        if (pending) {
            this._pending.delete(key);
            for (const data of pending) callback(data);
        }
    }

    /** Called by the transport when a message arrives. */
    _receive(msg) {
        if (!msg || typeof msg.k !== 'string') return;
        const handlers = this._handlers.get(msg.k);
        if (handlers && handlers.length) {
            for (const h of handlers.slice()) h(msg.d);
        } else if (this._buffer) {
            if (!this._pending.has(msg.k)) this._pending.set(msg.k, []);
            this._pending.get(msg.k).push(msg.d);
        }
    }

    /** Called by the transport when the connection closes. */
    _closed() {
        if (this.closed) return;
        this.closed = true;
        this._receive({ k: 'disconnect', d: null });
    }
}

/**
 * Creates two connected endpoints that talk to each other in-process. Messages
 * are delivered asynchronously and JSON-cloned, just like they would be over
 * the network, so the two sides never share object references.
 */
export function createLocalPair(bufferA = true, bufferB = true) {
    let a, b;
    const deliver = (target) => (msg) => {
        const copy = JSON.parse(JSON.stringify(msg));
        setTimeout(() => target._receive(copy), 0);
    };
    a = new Endpoint((msg) => deliver(b)(msg), bufferA);
    b = new Endpoint((msg) => deliver(a)(msg), bufferB);
    a.close = () => { setTimeout(() => { a._closed(); b._closed(); }, 0); };
    b.close = a.close;
    return [a, b];
}
