//imports
const Phaser = require("phaser");
const CardSprite = require("../classes/CardSprite");
const Fireball = require("../../server/game/cards/Fireball");
const Lightning = require("../../server/game/cards/Lightning");
const Shield = require("../../server/game/cards/Shield");
const Grandmaster = require("../../server/game/roles/Grandmaster");
const Wizard = require("../../server/game/roles/Wizard");
const Necromancer = require("../../server/game/roles/Necromancer");
const Player = require("../../server/game/Player");
const Field = require("../../server/game/Field")

class Maingame extends Phaser.Scene {


    constructor(){
        super("Maingame");
    }

    init(){

        //create test player to pass in
        mainPlayer = new Player();

    }

    create(){}
}