import Character from '../abstract/Character.js';

export default class Bacon extends Character {
    constructor() {
        super("Lord Bacon", "It is said he looks\nlike a peanut",
            "Old Money", "draws 2\ncards each turn.",
            { drawsPerTurn: 2 });
    }
}
