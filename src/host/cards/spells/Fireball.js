import Spell from '../abstract/Spell.js';

export default class Fireball extends Spell {
    constructor() {
        super("Fireball", "Explosive! Inflict\n10 Damage on all\nother players.", "others");
    }

    activate(field, caster, targets) {
        const source = field.players[caster];
        source?.calcStats();
        const damage = 10 + (source?.focus ?? 0);
        for (const [name, player] of Object.entries(field.players)) {
            // Ember is Fireproof
            if (name != caster && player.health > 0 && !player.character?.fireproof) {
                player.takeDamage(damage);
            }
        }
    }
}
