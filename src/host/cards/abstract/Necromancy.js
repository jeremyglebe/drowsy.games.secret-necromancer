import Spell from './Spell.js';

export default class Necromancy extends Spell {
    constructor(name, description, targetType) {
        super(name, description, targetType);
        this.type = 'necromancy';
        this.target = null;
    }

    /** Activated during the necromancy phase, using `this.target` */
    activate(field) { }
}
