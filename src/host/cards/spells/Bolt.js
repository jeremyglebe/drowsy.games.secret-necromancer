import Spell from '../abstract/Spell.js';
import { randInt } from '../../Tools.js';

export default class Bolt extends Spell {
    constructor() {
        super("Bolt", "Inflict 10-20 Damage\non target player.\nOne Bolt per turn.", "player");
        this.cost = 1;
        /** Like a Bang!, you only get one of these per turn */
        this.oncePerTurn = true;
    }

    activate(field, caster, target) {
        if (target == '##HORROR##') {
            const source = field.players[caster];
            source?.calcStats();
            const slain = field.damageHorror(randInt(10, 21) + (source?.focus ?? 0), caster);
            return { horror: true, slain };
        }
        const player = field.players[target];
        if (!player) return;
        const source = field.players[caster];
        source?.calcStats();
        player.calcStats();
        if (Math.random() < player.evasion) return { dodged: true };
        player.takeDamage(randInt(10, 21) + (source?.focus ?? 0));
    }
}
