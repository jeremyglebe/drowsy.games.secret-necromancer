import Item from '../abstract/Item.js';

export default class Robe extends Item {
    constructor() {
        super("Robe", "Equip: 20% chance to\ndodge a Bolt.\nStacks up to 60%.");
        this.cost = 1;
    }

    activate(user) {
        user.evasion = Math.min(0.6, user.evasion + 0.2);
    }
}
