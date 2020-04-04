//imports
const Phaser = require("phaser");
const CardSprite = require("../classes/CardSprite");
const Fireball = require("../../server/game/cards/Fireball");
const Lightning = require("../../server/game/cards/Lightning");
const Shield = require("../../server/game/cards/Shield");


/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

 class CardTest extends Phaser.Scene {

    constructor(){
        super("cardtest")
    }

    preload(){}

    init(){}

    create(){
        let serverCard01 = new Fireball;
        let serverCard02 = new Lightning;
        let serverCard03 = new Shield;

        let clientCard01 = new CardSprite(200,200, serverCard01, this);
        let clientCard02 = new CardSprite(600,200, serverCard02, this);
        let clientCard03 = new CardSprite(1000,200, serverCard03, this);
    }
 }

 // exports the class so it may be imported/required elsewhere
module.exports = CardTest;