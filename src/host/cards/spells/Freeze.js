import Spell from '../abstract/Spell.js';

export default class Freeze extends Spell {
    constructor() {
        super("Freeze", "Target player skips\ntheir next turn.", "player");
        this.cost = 3;
    }

    activate(field, caster, target) {
        const player = field.players[target];
        if (player) player.frozen = true;
    }
}
