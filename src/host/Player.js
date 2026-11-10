/** Mana everyone makes per turn before crystals */
export const BASE_INCOME = 1;
/** Everyone starts with this much health */
export const MAX_HEALTH = 40;
/** Most Shields / Robes that count */
const MAX_ARMOR = 3;
const MAX_DODGE = 3;

export default class Player {
    /**
     * @param {string} username
     * @param {import('./roles/Role.js').default} role
     * @param {import('./cards/abstract/Character.js').default} character
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
         * Stats from equipment: armor blocks that much from every hit, dodge
         * is how many Robes (dodge Bolts on 7 - dodge or more), focus is
         * added to your damage rolls.
         */
        this.armor = 0;
        this.dodge = 0;
        this.focus = 0;
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
    }

    /** Mana gained at the start of each turn */
    get income() {
        return BASE_INCOME + this.crystals;
    }

    calcStats() {
        const total = { armor: 0, dodge: 0, focus: 0 };
        for (const item of this.items) {
            for (const [stat, amount] of Object.entries(item.stats || {})) total[stat] = (total[stat] || 0) + amount;
        }
        this.armor = Math.min(MAX_ARMOR, total.armor);
        this.dodge = Math.min(MAX_DODGE, total.dodge);
        this.focus = total.focus;
    }

    /**
     * Applies damage after armor and abilities. Returns damage actually taken.
     * @param {object} tags what kind of damage it is ({ fire, dodgeable })
     */
    takeDamage(amount, tags = {}) {
        // Ember's Fireproof
        if (tags.fire && this.character?.fireproof) return 0;
        let damage = amount - this.armor;
        // Tiny's Thick Skin
        damage = Math.max(0, damage - (this.character?.damageReduction ?? 0));
        this.health -= damage;
        // Professor Mittens' Nine Lives (well, two)
        if (this.health <= 0 && this.character?.nineLives && !this.usedNineLives) {
            this.usedNineLives = true;
            this.health = 1;
            this.justSaved = true;
        }
        return damage;
    }
}
