/**
 * A computer player. It talks to the HostServer through an Endpoint exactly
 * like a human client does, so it only knows what a human would know.
 *
 * Good guys (Sorcerers and the Grandmaster) keep a suspicion score for every
 * other player and update it from what they see people do:
 *   - Bolting the Grandmaster is very suspicious
 *   - Bolting me (when I know I'm innocent) is suspicious
 *   - Bolting a suspect looks like something an ally would do
 *   - Fireballing while the Grandmaster is low is reckless at best
 *   - The Witch Brew victim probably isn't the Necromancer
 * Old evidence slowly fades each round.
 *
 * The Necromancer runs the same evidence rules from the table's point of
 * view, so it knows how guilty it looks and picks plays it can get away with:
 * Fireballs while the Grandmaster is healthy ("just clearing the table"),
 * Bolting whoever the table already suspects (looks like helping), and the
 * anonymous Witch Brew. It only Bolts the Grandmaster for the kill, or once
 * it's been caught anyway.
 *
 * Each bot gets a random personality so they don't all play the same.
 */

const NECRO_PHASE = '##NECRO##';

const rand = (min, max) => min + Math.random() * (max - min);
const chance = (p) => Math.random() < p;

export function randomPersonality() {
    return {
        /** How willing to act on weak evidence (probing Bolts, Fireballs) */
        aggression: rand(0.3, 0.9),
        /** Suspicion needed before committing to a target */
        paranoia: rand(1.2, 2.4),
        /** As Necromancer, how often to hit a Sorcerer instead of the GM */
        bluff: rand(0.35, 0.75),
    };
}

export default class Bot {
    /**
     * @param endpoint client-side Endpoint connected to the host
     * @param {object} options { delay: ms between actions, personality }
     */
    constructor(endpoint, options = {}) {
        this.socket = endpoint;
        this.delay = options.delay ?? 1200;
        this.personality = options.personality ?? randomPersonality();
        this.me = null;
        this.hand = [];
        /** Latest client-safe player info, by username */
        this.players = {};
        this.alive = new Set();
        this.grandmaster = null;
        this.over = false;
        /** Good guys: how much we suspect each player of being the Necromancer */
        this.suspicion = {};
        /** Total damage each player has done to us */
        this.hurtMe = {};
        /**
         * What the table as a whole probably thinks: the same evidence rules,
         * without anyone's private knowledge. The Necromancer uses this to
         * judge how suspicious it looks.
         */
        this.publicSuspicion = {};
        /** Players the Necromancer has raised */
        this.thralls = new Set();
        /** If we're a Thrall, the Necromancer we serve */
        this.master = null;
        /** Everyone currently dead, in order */
        this.dead = [];

        const s = this.socket;
        s.on('start game', (field) => {
            this.players = field.players;
            this.alive = new Set(Object.keys(field.players));
            for (const name of this.alive) {
                // Everyone starts with a slightly different gut feeling
                this.suspicion[name] = rand(-0.5, 0.5);
                this.publicSuspicion[name] = 0;
                this.hurtMe[name] = 0;
            }
        });
        s.on('your player', (player) => {
            this.me = player;
            this.hand = player.hand.slice();
            // Bots don't need long to read their cards
            setTimeout(() => this.socket.emit('ready'), Math.min(this.delay, 800));
        });
        s.on('your new card', (card) => this.hand.push(card));
        s.on('sync', ({ field, player }) => {
            this.players = field.players;
            this.hand = player.hand.slice();
        });
        s.on('spell played', (info) => {
            this.observe(info);
            this.players = info.field.players;
        });
        s.on('the gmaster bro reveals himself', (name) => { this.grandmaster = name; });
        s.on('death', (name) => {
            this.alive.delete(name);
            this.dead.push(name);
        });
        s.on('risen', (name) => {
            this.alive.add(name);
            this.dead = this.dead.filter((n) => n != name);
            this.thralls.add(name);
            // Everyone saw that. A Thrall is a known enemy of the good guys.
            if (name != this.name) {
                this.suspicion[name] = Math.max(this.suspicion[name] || 0, 2.5);
                this.publicSuspicion[name] = Math.max(this.publicSuspicion[name] || 0, 2.5);
            }
        });
        s.on('you rose', ({ role, necromancer }) => {
            this.me.role = role;
            this.master = necromancer;
        });
        s.on('game over', () => { this.over = true; });
        s.on('turn start', (name) => {
            if (name == NECRO_PHASE) {
                // Evidence fades a little each round
                for (const n in this.suspicion) this.suspicion[n] *= 0.85;
                for (const n in this.publicSuspicion) this.publicSuspicion[n] *= 0.85;
            }
            if (this.me && name == this.me.username) this.takeTurn();
        });
    }

    /* ---------------------------------------------------------------- */
    /* Knowledge                                                         */
    /* ---------------------------------------------------------------- */

    get name() { return this.me?.username; }
    get role() { return this.me?.role?.name; }
    get isNecro() { return this.role == 'Necromancer'; }
    /** Lilium gets two Bolts a turn */
    get boltsPerTurn() { return this.me?.character?.boltsPerTurn ?? 1; }

    hp(name) {
        return this.players[name]?.health ?? 0;
    }

    /** Fraction of damage a player's shields block */
    defense(name) {
        const shields = (this.players[name]?.items ?? []).filter((i) => i.name == 'Shield').length;
        return Math.min(0.6, shields * 0.15);
    }

    /** Living players other than me */
    others() {
        return [...this.alive].filter((n) => n != this.name);
    }

    /** Living players who could be the Necromancer, most suspicious first */
    suspects() {
        return this.others()
            .filter((n) => n != this.grandmaster)
            .sort((a, b) => (this.suspicion[b] - this.suspicion[a]) || (Math.random() - 0.5));
    }

    /**
     * The evidence rules. Given a card someone played, returns how much more
     * (or less) suspicious it makes each player look, as [name, amount] pairs.
     * @param info the 'spell played' message
     * @param sus the suspicion map to judge targets by
     * @param viewer whose eyes we're looking through (null for the table)
     */
    evidence({ caster, cardname, target }, sus, viewer) {
        if (caster == NECRO_PHASE) {
            // Whoever got brewed probably isn't the Necromancer
            return [[target, -1]];
        }
        if (caster == this.grandmaster || caster == viewer) return [];
        if (cardname == 'Bolt') {
            if (target == this.grandmaster) return [[caster, 3]];
            // Someone hit me, and I know I'm innocent
            if (viewer && target == viewer && !this.isNecro) return [[caster, 1.5]];
            // Hitting a suspect looks like helping; hitting someone who
            // looks innocent doesn't
            if ((sus[target] ?? 0) >= 1.5) return [[caster, -1]];
            if ((sus[target] ?? 0) <= -0.5) return [[caster, 1]];
            return [[caster, 0.3]];
        }
        if (cardname == 'Fireball') {
            // Fine while the GM is healthy, reckless once they're low
            return [[caster, this.hp(this.grandmaster) <= 30 ? 2 : 0.6]];
        }
        return [];
    }

    /** Updates beliefs from a card someone played */
    observe(info) {
        const { caster, field } = info;
        // Track who has been hurting us
        if (this.name && caster != NECRO_PHASE && caster != this.name) {
            const before = this.hp(this.name);
            const after = field.players[this.name]?.health ?? before;
            if (after < before) this.hurtMe[caster] = (this.hurtMe[caster] || 0) + (before - after);
        }

        // Our own beliefs. Each bot reads the same evidence a little differently.
        for (const [name, amount] of this.evidence(info, this.suspicion, this.name)) {
            if (name && name != this.grandmaster && name != this.name && name in this.suspicion) {
                this.suspicion[name] += amount * rand(0.6, 1.4);
            }
        }
        // The table's beliefs, including about us
        for (const [name, amount] of this.evidence(info, this.publicSuspicion, null)) {
            if (name && name != this.grandmaster && name in this.publicSuspicion) {
                this.publicSuspicion[name] += amount;
            }
        }
    }

    /** How much more suspicious than average the table thinks we look */
    get heat() {
        const others = this.others().filter((n) => n != this.grandmaster);
        if (!others.length) return 0;
        const avg = others.reduce((sum, n) => sum + this.publicSuspicion[n], 0) / others.length;
        return this.publicSuspicion[this.name] - avg;
    }

    /* ---------------------------------------------------------------- */
    /* Acting                                                            */
    /* ---------------------------------------------------------------- */

    wait() {
        return new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    find(name) {
        return this.hand.findIndex((c) => c.name == name);
    }

    count(name) {
        return this.hand.filter((c) => c.name == name).length;
    }

    /** Plays the first card with this name. Returns false if we don't have one. */
    async play(cardName, targets = null) {
        if (this.over) return false;
        const index = this.find(cardName);
        if (index < 0) return false;
        this.socket.emit('play spell', { index, name: cardName, targets });
        this.hand.splice(index, 1);
        await this.wait();
        return true;
    }

    async takeTurn() {
        // Wait for this turn's card(s) to arrive
        await this.wait();
        if (this.over) return;
        try {
            await this.equipItems();
            if (this.isNecro) await this.necromancerTurn();
            else if (this.role == 'Thrall') await this.thrallTurn();
            else await this.goodTurn();
        } finally {
            if (!this.over) this.socket.emit('turn end');
        }
    }

    async equipItems() {
        const items = this.players[this.name]?.items ?? [];
        const have = (name) => items.filter((i) => i.name == name).length;
        // Shields cap at 60% (4), Robes at 60% (3); Wands keep stacking
        const worthIt = { Shield: have('Shield') < 4, Robe: have('Robe') < 3, Wand: true };
        for (const item of ['Wand', 'Shield', 'Robe']) {
            if (this.over) return;
            if (this.find(item) >= 0 && worthIt[item] && (this.hp(this.name) < 80 || item == 'Wand' || chance(0.5))) {
                await this.play(item, this.name);
            }
        }
    }

    /** A Thrall serves the Necromancer: go after the Grandmaster, openly */
    async thrallTurn() {
        const gm = this.grandmaster;
        const target = this.alive.has(gm) ? gm
            : this.others().filter((n) => n != this.master && !this.thralls.has(n))[0];
        for (let b = 0; b < this.boltsPerTurn && target; b++) await this.play('Bolt', target);
        // Fireballs are fine as long as they won't finish off our master
        const masterHp = this.hp(this.master);
        if (masterHp > 15 && chance(0.7)) await this.play('Fireball');
    }

    async goodTurn() {
        const { aggression, paranoia } = this.personality;
        const [suspect] = this.suspects();
        if (!suspect) return;
        const certainty = this.suspicion[suspect];
        const isGM = this.name == this.grandmaster;
        const gmHp = this.hp(this.grandmaster);

        // Bolt our top suspect if we're fairly sure, or sometimes as a probe.
        // (Lilium can follow up with a second one.)
        for (let b = 0; b < this.boltsPerTurn; b++) {
            const [target] = this.suspects();
            if (!target) break;
            if (b == 0 ? (certainty >= paranoia || chance(aggression * 0.4)) : this.suspicion[target] >= paranoia) {
                await this.play('Bolt', target);
            }
        }

        // Fireball hurts the Grandmaster too, so think about it
        if (this.find('Fireball') >= 0) {
            const finishing = certainty >= paranoia && this.hp(suspect) <= 10 * (1 - this.defense(suspect));
            const safeForGM = isGM || gmHp > 40;
            if (safeForGM && (finishing || (isGM && chance(aggression * 0.6)) || (gmHp > 60 && chance(aggression * 0.15)))) {
                await this.play('Fireball');
            }
        }
    }

    async necromancerTurn() {
        const gm = this.grandmaster;
        const gmAlive = this.alive.has(gm);
        const gmHp = this.hp(gm);
        const gmTakes = (dmg) => dmg - Math.ceil(dmg * this.defense(gm));
        const caught = this.heat >= 3;

        // A corpse on the table? Raise it to fight for us. (One ritual per turn.)
        const corpse = this.dead.find((n) => n != gm && n != this.name);
        if (corpse && this.find('Raise Dead') >= 0) {
            await this.play('Raise Dead', corpse);
        } else if (this.find('Witch Brew') >= 0) {
            await this.brew(gm, gmAlive, gmHp, gmTakes);
        }
        if (!gmAlive) return;
        await this.necromancerPlays(gm, gmHp, gmTakes, caught);
    }

    async brew(gm, gmAlive, gmHp, gmTakes) {
        // Witch Brew is anonymous, so nobody can pin it on us. Aim it at the
        // GM when it would finish them (or now and then), otherwise at whoever
        // has been coming after us.
        const threat = this.others().filter((n) => n != gm && !this.thralls.has(n))
            .sort((a, b) => (this.hurtMe[b] || 0) - (this.hurtMe[a] || 0))[0];
        const victim = !gmAlive ? threat
            : (gmHp <= gmTakes(30) || !threat || chance(0.6)) ? gm : threat;
        if (victim) await this.play('Witch Brew', victim);
    }

    async necromancerPlays(gm, gmHp, gmTakes, caught) {

        // Can we finish the Grandmaster right now? Then stop pretending.
        const fireballs = this.count('Fireball');
        const minDamage = (this.find('Bolt') >= 0 ? gmTakes(10) : 0) + fireballs * gmTakes(10);
        if (minDamage >= gmHp || caught) {
            while (this.alive.has(gm) && await this.play('Fireball')) { /* keep burning */ }
            if (this.alive.has(gm)) await this.play('Bolt', gm);
            return;
        }

        // A Fireball while the GM is healthy reads as "just clearing the
        // table", so it's the safest way to chip at them. Throw a second one
        // only if nobody's looking at us yet.
        if (gmHp > 30 && await this.play('Fireball')) {
            if (this.heat < 0.5 && chance(0.2)) await this.play('Fireball');
        }

        // Bolt whoever the table already suspects most. It looks like we're
        // helping, and it gets a Sorcerer out of the way. If nobody stands
        // out, hit back at someone who's been hitting us, which looks like
        // self-defense.
        const sorcerers = this.others().filter((n) => n != gm && !this.thralls.has(n));
        const framed = sorcerers.sort((a, b) => this.publicSuspicion[b] - this.publicSuspicion[a])[0];
        if (framed && this.publicSuspicion[framed] >= 1) {
            for (let b = 0; b < this.boltsPerTurn; b++) await this.play('Bolt', framed);
        } else {
            const attacker = sorcerers.sort((a, b) => (this.hurtMe[b] || 0) - (this.hurtMe[a] || 0))[0];
            if (attacker && (this.hurtMe[attacker] || chance(this.personality.aggression * 0.5))) {
                await this.play('Bolt', attacker);
            }
        }
    }
}
