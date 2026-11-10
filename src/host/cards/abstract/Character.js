import Card from './Card.js';

/**
 * A character card. Like Bang!, every character has one always-on ability.
 * Abilities are described by perks that the rules check for:
 *   drawsPerTurn, boltsPerTurn, damageReduction, nineLives, fireproof
 */
export default class Character extends Card {

    /**
     * @param {string} name
     * @param {string} flavor the joke line (with \n line breaks for the card)
     * @param {string} ability the ability's name
     * @param {string} abilityText what it does (with \n line breaks)
     * @param {object} perks the rule tweaks this character gets
     */
    constructor(name, flavor, ability, abilityText, perks = {}) {
        super(name, `${ability}: ${abilityText}\n"${flavor}"`);
        this.type = 'character';
        this.flavor = flavor;
        this.ability = ability;
        this.abilityText = abilityText;
        Object.assign(this, perks);
    }
}
