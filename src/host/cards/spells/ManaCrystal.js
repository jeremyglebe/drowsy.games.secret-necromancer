import Spell from '../abstract/Spell.js';

export default class ManaCrystal extends Spell {
    constructor() {
        super("Mana Crystal", "Free. You make 1\nmore mana every\nturn from now on.", "self");
        this.cost = 0;
    }

    activate(field, caster) {
        field.players[caster].crystals++;
    }
}
