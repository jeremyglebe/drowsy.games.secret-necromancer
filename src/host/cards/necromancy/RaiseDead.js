import Necromancy from '../abstract/Necromancy.js';

export default class RaiseDead extends Necromancy {
    constructor() {
        super("Raise Dead", "A dead player comes\nback with half HP\nas your Thrall.", 'dead');
    }

    activate(field) {
        field.raise(this.target);
    }
}
