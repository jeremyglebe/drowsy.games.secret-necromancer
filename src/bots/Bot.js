/**
 * A very simple computer player. It talks to the HostServer through an
 * Endpoint exactly like a human client does.
 */
export default class Bot {
    /**
     * @param endpoint client-side Endpoint connected to the host
     * @param {object} options { delay: ms between actions, maxPlays: cards per turn }
     */
    constructor(endpoint, options = {}) {
        this.socket = endpoint;
        this.delay = options.delay ?? 1200;
        this.maxPlays = options.maxPlays ?? 2;
        this.me = null;
        this.hand = [];
        this.players = {};
        this.alive = new Set();
        this.grandmaster = null;
        this.over = false;

        const s = this.socket;
        s.on('start game', (field) => {
            this.players = field.players;
            this.alive = new Set(Object.keys(field.players));
        });
        s.on('your player', (player) => {
            this.me = player;
            this.hand = player.hand.slice();
        });
        s.on('your new card', (card) => this.hand.push(card));
        s.on('sync', ({ field, player }) => {
            this.players = field.players;
            this.hand = player.hand.slice();
        });
        s.on('the gmaster bro reveals himself', (name) => { this.grandmaster = name; });
        s.on('death', (name) => this.alive.delete(name));
        s.on('game over', () => { this.over = true; });
        s.on('turn start', (name) => {
            if (this.me && name == this.me.username) this.takeTurn();
        });
    }

    wait() {
        return new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    get role() {
        return this.me?.role?.name;
    }

    /** Pick a victim for a single-target card */
    chooseTarget() {
        const others = [...this.alive].filter((n) => n != this.me.username);
        if (others.length == 0) return null;
        // The Necromancer goes for the Grandmaster
        if (this.role == 'Necromancer' && this.alive.has(this.grandmaster)) {
            return this.grandmaster;
        }
        // Good guys don't know who the Necromancer is: never hit the GM
        const suspects = others.filter((n) => n != this.grandmaster);
        const pool = suspects.length ? suspects : others;
        // Gang up on whoever is lowest, with a little randomness
        pool.sort((a, b) => (this.players[a]?.health ?? 100) - (this.players[b]?.health ?? 100));
        return Math.random() < 0.6 ? pool[0] : pool[Math.floor(Math.random() * pool.length)];
    }

    play(index, targets) {
        const card = this.hand[index];
        this.socket.emit('play spell', { index, name: card.name, targets });
        this.hand.splice(index, 1);
    }

    async takeTurn() {
        // Wait for the drawn card(s) to arrive
        await this.wait();
        if (this.over) return;

        // Necromancer queues up a necromancy card first
        const necro = this.hand.findIndex((c) => c.type == 'necromancy');
        if (necro >= 0) {
            const target = this.chooseTarget();
            if (target) this.play(necro, target);
            await this.wait();
        }

        for (let plays = 0; plays < this.maxPlays && !this.over; plays++) {
            const shield = this.hand.findIndex((c) => c.type == 'item');
            const bolt = this.hand.findIndex((c) => c.name == 'Bolt');
            const fireball = this.hand.findIndex((c) => c.name == 'Fireball');
            // Don't fireball if it would hurt the Grandmaster as a good guy,
            // unless there's nothing else to do
            const fireballOk = this.role == 'Necromancer' || bolt < 0;

            if (shield >= 0 && plays == 0 && Math.random() < 0.5) {
                this.play(shield, this.me.username);
            } else if (fireball >= 0 && fireballOk) {
                this.play(fireball, null);
            } else if (bolt >= 0) {
                const target = this.chooseTarget();
                if (!target) break;
                this.play(bolt, target);
            } else {
                break;
            }
            await this.wait();
        }

        if (!this.over) this.socket.emit('turn end');
    }
}
