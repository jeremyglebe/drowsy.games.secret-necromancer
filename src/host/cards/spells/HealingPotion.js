import Spell from '../abstract/Spell.js';

export default class HealingPotion extends Spell {
    constructor() {
        super("Healing Potion", "Heal yourself or\nanother player for\n15 HP.", "any");
        this.cost = 2;
    }

    activate(field, caster, target) {
        const player = field.players[target] || field.players[caster];
        if (!player || player.health <= 0) return;
        const before = player.health;
        player.health = Math.min(100, player.health + 15);
        return { healed: player.health - before };
    }
}
