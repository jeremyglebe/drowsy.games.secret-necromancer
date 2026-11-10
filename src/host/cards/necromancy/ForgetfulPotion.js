import Necromancy from '../abstract/Necromancy.js';
import { randInt } from '../../Tools.js';

export default class ForgetfulPotion extends Necromancy {
    constructor() {
        super("Witch Brew", "Player loses a\nrandom card\n", 'player');
    }

    activate(field) {
        const player = field.players[this.target];
        if (!player || player.hand.length == 0) return;
        const [card] = player.hand.splice(randInt(0, player.hand.length), 1);
        field.discardCard(card);
    }
}
