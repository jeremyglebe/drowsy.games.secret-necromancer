import Necromancy from '../abstract/Necromancy.js';
import { randInt } from '../../Tools.js';

/** Witch Brew. The file name is left over from the jam. */
export default class ForgetfulPotion extends Necromancy {
    constructor() {
        super("Witch Brew", "Victim loses all\ntheir banked mana\nand 2 random cards.", 'player');
        this.cost = 1;
    }

    activate(field) {
        const player = field.players[this.target];
        if (!player || player.health <= 0) return;
        player.mana = 0;
        field.sendMana(this.target);
        for (let i = 0; i < 2 && player.hand.length; i++) {
            const [card] = player.hand.splice(randInt(0, player.hand.length), 1);
            field.discardCard(card);
        }
    }
}
