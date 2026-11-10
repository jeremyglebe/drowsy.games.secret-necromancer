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
 * The Necromancer bluffs: it spends some Bolts on Sorcerers to blend in,
 * leans on Fireball for "accidental" Grandmaster damage, and goes all in when
 * it can finish the Grandmaster this turn. Its Witch Brew goes to whoever has
 * been hurting it.
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

        const s = this.socket;
        s.on('start game', (field) => {
            this.players = field.players;
            this.alive = new Set(Object.keys(field.players));
            for (const name of this.alive) {
                // Everyone starts with a slightly different gut feeling
                this.suspicion[name] = rand(-0.5, 0.5);
                this.hurtMe[name] = 0;
            }
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
        s.on('spell played', (info) => {
            this.observe(info);
            this.players = info.field.players;
        });
        s.on('the gmaster bro reveals himself', (name) => { this.grandmaster = name; });
        s.on('death', (name) => this.alive.delete(name));
        s.on('game over', () => { this.over = true; });
        s.on('turn start', (name) => {
            if (name == NECRO_PHASE) {
                // Evidence fades a little each round
                for (const n in this.suspicion) this.suspicion[n] *= 0.85;
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

    hp(name) {
        return this.players[name]?.health ?? 0;
    }

    /** Fraction of damage a player's shields block */
    defense(name) {
        return Math.min(0.6, (this.players[name]?.items?.length ?? 0) * 0.15);
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

    /** Updates beliefs from a card someone played */
    observe({ caster, cardname, target, field }) {
        // Track who has been hurting us
        if (this.name && caster != NECRO_PHASE && caster != this.name) {
            const before = this.hp(this.name);
            const after = field.players[this.name]?.health ?? before;
            if (after < before) this.hurtMe[caster] = (this.hurtMe[caster] || 0) + (before - after);
        }

        const sus = this.suspicion;
        // Each bot reads the same evidence a little differently
        const bump = (name, amount) => {
            if (name && name != this.grandmaster && name != this.name && name in sus) sus[name] += amount * rand(0.6, 1.4);
        };

        if (caster == NECRO_PHASE) {
            // The Necromancer doesn't brew against themself
            bump(target, -1);
            return;
        }
        if (caster == this.name || caster == this.grandmaster) return;

        if (cardname == 'Bolt') {
            if (target == this.grandmaster) {
                bump(caster, 3);
            } else if (target == this.name && !this.isNecro) {
                bump(caster, 1.5);
            } else if ((sus[target] ?? 0) >= 1.5) {
                bump(caster, -1);
            } else if ((sus[target] ?? 0) <= -0.5) {
                bump(caster, 1);
            } else {
                bump(caster, 0.3);
            }
        } else if (cardname == 'Fireball') {
            bump(caster, this.hp(this.grandmaster) <= 30 ? 2 : 0.6);
        }
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
            await this.equipShields();
            if (this.isNecro) await this.necromancerTurn();
            else await this.goodTurn();
        } finally {
            if (!this.over) this.socket.emit('turn end');
        }
    }

    async equipShields() {
        // Shields stop helping at 60% (4 shields)
        const equipped = this.players[this.name]?.items?.length ?? 0;
        if (this.find('Shield') >= 0 && equipped < 4 && (this.hp(this.name) < 80 || chance(0.5))) {
            await this.play('Shield', this.name);
        }
    }

    async goodTurn() {
        const { aggression, paranoia } = this.personality;
        const [suspect] = this.suspects();
        if (!suspect) return;
        const certainty = this.suspicion[suspect];
        const isGM = this.name == this.grandmaster;
        const gmHp = this.hp(this.grandmaster);

        // Bolt our top suspect if we're fairly sure, or sometimes as a probe
        if (certainty >= paranoia || chance(aggression * 0.4)) {
            await this.play('Bolt', suspect);
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

        // Queue the Witch Brew against whoever has hurt us the most
        if (this.find('Witch Brew') >= 0) {
            const enemies = this.others().sort((a, b) => (this.hurtMe[b] || 0) - (this.hurtMe[a] || 0));
            const victim = (this.hurtMe[enemies[0]] || 0) > 0 ? enemies[0] : (gmAlive ? gm : enemies[0]);
            if (victim) await this.play('Witch Brew', victim);
        }
        if (!gmAlive) return;

        // Can we finish the Grandmaster right now? Then stop pretending.
        const fireballs = this.count('Fireball');
        const minDamage = (this.find('Bolt') >= 0 ? gmTakes(10) : 0) + fireballs * gmTakes(10);
        if (minDamage >= gmHp) {
            while (this.alive.has(gm) && await this.play('Fireball')) { /* keep burning */ }
            if (this.alive.has(gm)) await this.play('Bolt', gm);
            return;
        }

        // Otherwise blend in. Bolting the GM is the one thing that gives us
        // away, so only do it once they're weak enough that it's worth it.
        const bluff = gmHp > 45 ? 1 : this.personality.bluff;
        if (chance(bluff)) {
            // Hit a Sorcerer, preferably one who's been hitting us (looks like self-defense)
            const sorcerers = this.others().filter((n) => n != gm)
                .sort((a, b) => (this.hurtMe[b] || 0) - (this.hurtMe[a] || 0) || this.hp(a) - this.hp(b));
            if (sorcerers.length) await this.play('Bolt', sorcerers[0]);
        } else {
            await this.play('Bolt', gm);
        }

        // Fireball is deniable Grandmaster damage
        if (chance(gmHp < 50 ? 0.7 : 0.35)) await this.play('Fireball');
    }
}
