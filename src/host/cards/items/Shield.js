import Item from '../abstract/Item.js';

export default class Shield extends Item {
    constructor() {
        super("Shield", "Equip: blocks 15%\nof incoming damage.\nStacks up to 60%.");
        this.cost = 1;
    }

    activate(user) {
        user.defense = Math.min(0.6, user.defense + 0.15);
    }
}
