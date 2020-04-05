const tools = require('../../../Tools');
const Spell = require("../abstract/Spell");

class Bolt extends Spell {

    constructor() {
        super("Bolt", ""
            + "Inflict 10-20 Damage\n"
            + "on target player.", "player");
    }

    activate(field, caster, target) {
        let player = field.players[target];
        player.calcStats();
        let damage = tools.random.int(10, 20);
        damage -= Math.ceil(damage * player.defense);
        player.health -= damage;
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Bolt;