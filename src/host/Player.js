/** Mana everyone makes per turn before crystals */
export const BASE_INCOME = 1;

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
        /** Health of the player, out of 100 */
        this.health = 100;
        /** Stats, recalculated from items whenever used */
        this.defense = 0;
        this.evasion = 0;
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
        this.defense = 0;
        this.evasion = 0;
        this.focus = 0;
        for (const item of this.items) {
            item.activate(this);
        }
    }

    /** Applies damage reduced by defense. Returns damage actually taken. */
    takeDamage(amount) {
        this.calcStats();
        let damage = amount - Math.ceil(amount * this.defense);
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
