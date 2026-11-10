import Character from '../abstract/Character.js';

export default class Tiny extends Character {
    constructor() {
        super("Tiny", "All her sisters\nwere 8'9\"",
            "Thick Skin", "takes 1\nless damage from\nevery hit.",
            { damageReduction: 1 });
    }
}
