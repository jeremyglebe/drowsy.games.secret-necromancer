import Necromancy from '../abstract/Necromancy.js';

export default class RiseFromTheDead extends Necromancy {
    constructor() {
        super("Rise From the Dead", "A dead player comes\nback with half HP\nas your Thrall.", 'dead');
    }

    activate(field) {
        field.raise(this.target);
    }
}
