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
const Field = require("../../server/game/Field");
const Tiny = require("../../server/game/characters/Tiny");
const Bacon = require("../../server/game/characters/Bacon")
const Lilium = require("../../server/game/characters/Lilium")

class MainGame extends Phaser.Scene {


    constructor(){
        super("MainGame");
    }

    /** stores an array of the card sprites */
    hand = [];

    init(){
        //creat test field
        let feild = new Field(["greg","kenny", "The Big Z","Jeremy"])
        //create role to pass in
        let role = new Grandmaster;
        //create players character
        let char = new Tiny;
        //create test player to pass in
        this.mainPlayer = new Player("The Big Z",role,char,Field);
        //create players deck
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.mainPlayer.hand.push(new Fireball);
        this.mainPlayer.hand.push(new Lightning);
        this.mainPlayer.hand.push(new Shield);
        this.placePlayerSprites();

        //set up an array of they other players
        this.otherPlayers = [];
        //create their characters
        let char02 = new Tiny;
        let char03 = new Bacon;
        let char04 = new Bacon;
        let char05 = new Lilium;
        let otherPlayer02 = new Player("The Big Z",role,char02,Field);
        let otherPlayer03 = new Player("The Big Z",role,char03,Field);
        let otherPlayer04 = new Player("The Big Z",role,char04,Field);
        let otherPlayer05 = new Player("The Big Z",role,char05,Field);
        this.otherPlayers.push(otherPlayer02);
        this.otherPlayers.push(otherPlayer03);
        this.otherPlayers.push(otherPlayer04);
        this.otherPlayers.push(otherPlayer05);
        for (let i = 0; i < this.otherPlayers.length; i++){
            for (let j = 0; j < i+1; j++){
                this.otherPlayers[i].hand.push(new Fireball);
            }
        }

        this.placeOtherPlayersSprites();
    }

    create(){}

    placePlayerSprites(){
        //place all the cards that are in the players hand
        for (let i = 0; i < this.mainPlayer.hand.length; i++){
            let tempCard = new CardSprite(200, 650, this.mainPlayer.hand[i], this.mainPlayer.hand.length - i, this);
            this.hand.push(tempCard);
        }
        //sort them at the bottom are of the screen with 200px padding on both sides of the hand
        this.placeHand();

        //place the character card
        this.mainPlayer.characterSprite = new CardSprite(50,650,this.mainPlayer.character,0,this);
        //place the role card
        this.mainPlayer.RoleSprite = new CardSprite(50,500,this.mainPlayer.role,0,this);
    }

    placeOtherPlayersSprites(){
        this.otherPlayers.charSprites = [];
        this.otherPlayers.healthText = [];
        this.otherPlayers.cardCountIcons = [];
        this.otherPlayers.cardCountText = [];
        let textStyle = {
            Font: "20px", 
            color: "white"
        }
        //We assume atleast 3 players since that is the server set minimum, we place them first, then add more if there is more
        //First Other Player
        this.otherPlayers.charSprites[0] = new CardSprite(50, 70, this.otherPlayers[0].character, 0, this);
        this.otherPlayers.healthText[0] = this.add.text(100,15, String(this.otherPlayers[0].health) + "/100",textStyle);
        this.otherPlayers.cardCountIcons[0] = this.add.sprite(120,70,"backofspell_graphic").setScale(.7);
        this.otherPlayers.cardCountText[0] = this.add.text(150,60, String(this.otherPlayers[0].hand.length),textStyle);
        //Second Other Player
        this.otherPlayers.charSprites[1] = new CardSprite(1230, 70, this.otherPlayers[1].character, 0, this);
        this.otherPlayers.healthText[1] = this.add.text(1110,15, String(this.otherPlayers[1].health) + "/100",textStyle);
        this.otherPlayers.cardCountIcons[1] = this.add.sprite(1160,70,"backofspell_graphic").setScale(.7);
        this.otherPlayers.cardCountText[1] = this.add.text(1120,60, String(this.otherPlayers[1].hand.length),textStyle);
        //Third Other Player if there is one
        if(this.otherPlayers.length >= 3){
            this.otherPlayers.charSprites[2] = new CardSprite(50, 250, this.otherPlayers[2].character, 0, this);
            this.otherPlayers.healthText[2] = this.add.text(100,195, String(this.otherPlayers[2].health) + "/100",textStyle);
            this.otherPlayers.cardCountIcons[2] = this.add.sprite(120,250,"backofspell_graphic").setScale(.7);
            this.otherPlayers.cardCountText[2] = this.add.text(150,240, String(this.otherPlayers[2].hand.length),textStyle);
        }
        //Fourth Other Player if there is one
        if(this.otherPlayers.length == 4){
            this.otherPlayers.charSprites[3] = new CardSprite(1230, 250, this.otherPlayers[3].character, 0, this);
            this.otherPlayers.healthText[3] = this.add.text(1110,195, String(this.otherPlayers[3].health) + "/100",textStyle);
            this.otherPlayers.cardCountIcons[3] = this.add.sprite(1160,250,"backofspell_graphic").setScale(.7);
            this.otherPlayers.cardCountText[3] = this.add.text(1120,240, String(this.otherPlayers[3].hand.length),textStyle);
        }
    }

    placeHand(){
        let increment = 880 / this.mainPlayer.hand.length;
        let pos = 200;
        for (let i = 0; i < this.mainPlayer.hand.length; i++){
            this.hand[i].move(pos,650);
            this.hand[i].setDepth(this.mainPlayer.hand.length - i);
            pos += increment;
        }
    }
}

// exports the class so it may be imported/required elsewhere
 module.exports = MainGame;