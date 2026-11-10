import Necromancy from '../abstract/Necromancy.js';
import { randInt } from '../../Tools.js';

export default class ForgetfulPotion extends Necromancy {
    constructor() {
        super("Witch Brew", "Victim takes 30\ndamage and loses a\nrandom card.", 'player');
    }

    activate(field) {
        const player = field.players[this.target];
        if (!player || player.health <= 0) return;
        player.takeDamage(30);
        if (player.hand.length == 0) return;
        const [card] = player.hand.splice(randInt(0, player.hand.length), 1);
        field.discardCard(card);
    }
}
