const Spell = require("../abstract/Spell");

class Fireball extends Spell {

    constructor() {
        super("Fireball", ""
            + "Explosive! Inflict\n"
            + "10 Damage on all\n"
            + "other players.", "others");
    }

    activate(field, caster, targets) {
        let players = field.players;
        for (let [key, player] of Object.entries(players)) {
            if (key != caster) {
                player.calcStats();
                let damage = 10;
                damage -= Math.ceil(damage * player.defense);
                player.health -= damage;
            }
        }
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Fireball;