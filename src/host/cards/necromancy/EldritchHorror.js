import Necromancy from '../abstract/Necromancy.js';

export default class EldritchHorror extends Necromancy {
    constructor() {
        super("Eldritch Horror", "Summon a monster to\nthe table. It mauls\nsomeone at random\nevery round.", 'all');
        this.cost = 3;
    }

    activate(field) {
        field.summonHorror();
    }
}
