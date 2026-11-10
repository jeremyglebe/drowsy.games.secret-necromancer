/** Mana everyone makes per turn before crystals */
export const BASE_INCOME = 1;
/** Everyone starts with this much health */
export const MAX_HEALTH = 40;


import { statOf, isImmune, deathWardOf } from './cards/passives.js';

export default class Player {
    /**
     * @param {string} username
     * @param {import('./roles/Role.js').default} role
     * @param {object} character a character card from cards.js
     */
    constructor(username, role, character) {
        /** Username of the player (also the key in Field.players) */
        this.username = username;
        /**
         * Role of the user is what "team" they're on. Grandmasters & Sorcerers
         * are fighting the Necromancer. The Grandmaster is known to everyone,
         * but whether another player is a Sorcerer or the Necromancer is a
         * mystery.
         */
        this.role = role;
        /** What character the player is */
        this.character = character;
        /** Health of the player */
        this.health = MAX_HEALTH;
        this.maxHealth = MAX_HEALTH;
        /**
         * Stats from passives (character and equipment): armor blocks that
         * much from every hit, evasion dodges Bolts on (7 - evasion) or more,
         * power is added to your damage rolls.
         */
        this.armor = 0;
        this.evasion = 0;
        this.power = 0;
        /** How many times a Death Ward has saved them */
        this.wardsUsed = 0;
        /** List of cards in the player's hand */
        this.hand = [];
        /** List of item cards the player has equipped */
        this.items = [];
        /**
         * Banked mana. Private: only the player knows how much they have, so
         * nobody can tell saving up from secretly paying for dark rituals.
         */
        this.mana = 0;
        /** Mana Crystals played. Public: everyone can see your income. */
        this.crystals = 0;
        // Character passives (Tiny's Armor) count from the start
        this.calcStats();
        this.health = this.maxHealth;
    }

    /** Mana gained at the start of each turn */
    get income() {
        return BASE_INCOME + this.crystals;
    }

    calcStats() {
        this.armor = statOf(this, 'armor');
        this.evasion = statOf(this, 'evasion');
        this.power = statOf(this, 'power');
        this.maxHealth = MAX_HEALTH + statOf(this, 'maxHealth');
        this.health = Math.min(this.health, this.maxHealth);
    }

    /**
     * Applies damage after armor and abilities. Returns damage actually taken.
     * @param {object} tags what kind of damage it is ({ fire, dodgeable })
     */
    takeDamage(amount, tags = {}) {
        if (isImmune(this, tags)) return 0;
        this.calcStats();
        const damage = Math.max(0, amount - this.armor);
        this.health -= damage;
        const ward = deathWardOf(this);
        if (this.health <= 0 && ward && this.wardsUsed < ward.times) {
            this.wardsUsed++;
            this.health = ward.hp;
            this.justSaved = true;
        }
        return damage;
    }
}
