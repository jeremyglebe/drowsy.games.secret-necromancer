import Character from '../abstract/Character.js';

export default class Mittens extends Character {
    constructor() {
        super("Professor Mittens", "Tenured. Nobody\nknows in what.",
            "Nine Lives", "survives\nthe first death\nat 1 HP.",
            { nineLives: true });
    }
}
