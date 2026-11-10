import Spell from '../abstract/Spell.js';
import { randInt } from '../../Tools.js';

export default class Bolt extends Spell {
    constructor() {
        super("Bolt", "Inflict 10-20 Damage\non target player.", "player");
    }

    activate(field, caster, target) {
        const player = field.players[target];
        if (!player) return;
        player.takeDamage(randInt(10, 21));
    }
}
