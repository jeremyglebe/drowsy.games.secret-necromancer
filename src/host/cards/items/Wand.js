import Item from '../abstract/Item.js';

export default class Wand extends Item {
    constructor() {
        super("Wand", "Equip: your Bolts and\nFireballs deal +5\ndamage. Stacks.");
        this.cost = 1;
    }

    activate(user) {
        user.focus += 5;
    }
}
