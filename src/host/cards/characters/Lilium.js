import Character from '../abstract/Character.js';

export default class Lilium extends Character {
    constructor() {
        super("Lilium", "It was a name I\nsuppose",
            "Quick Draw", "can cast\n2 Bolts per turn.",
            { boltsPerTurn: 2 });
    }
}
