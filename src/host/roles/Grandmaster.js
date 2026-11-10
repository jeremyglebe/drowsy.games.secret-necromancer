import Role from './Role.js';

export default class Grandmaster extends Role {
    constructor() {
        super("Grandmaster", "You must destroy the\nNecromancer!");
    }
}
