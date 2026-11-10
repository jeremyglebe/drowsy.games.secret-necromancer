import Character from '../abstract/Character.js';

export default class Tiny extends Character {
    constructor() {
        super("Tiny", "All her sisters\nwere 8'9\"",
            "Thick Skin", "takes 3\nless damage from\neverything.",
            { damageReduction: 3 });
    }
}
