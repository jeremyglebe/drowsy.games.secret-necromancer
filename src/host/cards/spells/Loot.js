import Spell from '../abstract/Spell.js';
import { randInt } from '../../Tools.js';

export default class Loot extends Spell {
    constructor() {
        super("Loot", "Steal a random card\nfrom another player.", "player");
        this.cost = 1;
    }

    activate(field, caster, target) {
        const victim = field.players[target];
        if (!victim) return;
        // Secret dark arts stay secret: those can't be stolen
        const stealable = victim.hand.map((c, i) => i).filter((i) => victim.hand[i].type != 'necromancy');
        if (!stealable.length) return { empty: true };
        const [card] = victim.hand.splice(stealable[randInt(0, stealable.length)], 1);
        field.giveCard(caster, card);
        return { looted: true };
    }
}
