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

    /** stores an array of the card sprites */
    hand = [];

    init(){
        console.log("Made it here")
        //creat test field
        let feild = new Field(["greg","kenny", "The Big Z","Jeremy"])
        //create test player to pass in
        this.mainPlayer = new Player("The Big Z", "Grandmaster",Field);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Grandmaster);
        this.mainPlayer.hand.push(new Wizard);
        this.mainPlayer.hand.push(new Necromancer);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Grandmaster);
        this.mainPlayer.hand.push(new Wizard);
        this.mainPlayer.hand.push(new Necromancer);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Grandmaster);
        this.mainPlayer.hand.push(new Wizard);
        this.mainPlayer.hand.push(new Necromancer);
        this.placePlayerSprites();
    }

    create(){}

    placePlayerSprites(){
        //place all the cards in the players hands
        let increment = 880 / this.mainPlayer.hand.length;
        let pos = 200;
        for (let i = 0; i < this.mainPlayer.hand.length; i++){
            let tempCard = new CardSprite(pos, 650, this.mainPlayer.hand[i], this.mainPlayer.hand.length - i, this);
            console.log(tempCard.depth)
            this.hand.push(tempCard);
            pos += increment;
        }
    }
}

// exports the class so it may be imported/required elsewhere
 module.exports = Maingame;