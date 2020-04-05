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


    constructor() {
        super("MainGame");
    }

    /** stores an array of the card sprites */
    hand = [];

    init() {
        //creat test field
        let feild = new Field(["greg", "kenny", "The Big Z", "Jeremy"])
        //create role to pass in
        let role = new Grandmaster;
        //create players character
        let char = new Tiny;
        //create test player to pass in
        this.mainPlayer = new Player("The Big Z", role, char, Field);
        this.mainPlayer.handSprites = [];
        //create players deck
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.addCard(new Fireball);
        this.addCard(new Lightning);
        this.addCard(new Shield);
        this.placePlayerSprites();


        //create their characters
        let char02 = new Tiny;
        let char03 = new Bacon;
        let char04 = new Bacon;
        let char05 = new Lilium;
        let otherPlayer02 = new Player("The Big Z", role, char02, Field);
        let otherPlayer03 = new Player("cheesy", role, char03, Field);
        let otherPlayer04 = new Player("Mike", role, char04, Field);
        let otherPlayer05 = new Player("Kaleb", role, char05, Field);
        this.otherPlayers = {}; 
        this.otherPlayers[otherPlayer02.username] = otherPlayer02;
        this.otherPlayers[otherPlayer03.username] = otherPlayer03;
        this.otherPlayers[otherPlayer04.username] = otherPlayer04;
        this.otherPlayers[otherPlayer05.username] = otherPlayer05;

        this.otherPlayers[otherPlayer02.username].hand = 5;
        this.otherPlayers[otherPlayer03.username].hand = 6;
        this.otherPlayers[otherPlayer04.username].hand = 2;
        this.otherPlayers[otherPlayer05.username].hand = 8;

        this.initalSetPlayersSprites();
    }

    create() { }

    placePlayerSprites() {
        //sort them at the bottom are of the screen with 200px padding on both sides of the hand
        this.placeHand();
        //place the character card
        this.mainPlayer.characterSprite = new CardSprite(50, 650, this.mainPlayer.character, 0, this);
        this.mainPlayer.characterSprite.setDraggable(false);
        //place the role card
        this.mainPlayer.RoleSprite = new CardSprite(50, 500, this.mainPlayer.role, 0, this);
        this.mainPlayer.RoleSprite.setDraggable(false);
        //place the health text
        this.mainPlayer.healthText = this.add.text(1140, 650, String(this.mainPlayer.health) + "/100",{color: "white"});
        this.mainPlayer.healthText.setFontSize(30);
    }

    initalSetPlayersSprites() {
        let keys = Object.keys(this.otherPlayers);
        let textStyle = {
            Font: "20px",
            color: "white"
        }
        //We assume atleast 3 players since that is the server set minimum, we place them first, then add more if there is more
        //First Other Player
        this.otherPlayers[keys[0]].charSprite = new CardSprite(50, 70, this.otherPlayers[keys[0]].character, 0, this);
        this.otherPlayers[keys[0]].charSprite.setDraggable(false);
        this.otherPlayers[keys[0]].healthText = this.add.text(100, 15, String(this.otherPlayers[keys[0]].health) + "/100", textStyle);
        this.otherPlayers[keys[0]].cardCountIcons = this.add.sprite(120, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers[keys[0]].cardCountText = this.add.text(150, 60, String(this.otherPlayers[keys[0]].hand), textStyle);
        //Second Other Player
        this.otherPlayers[keys[1]].charSprite = new CardSprite(1230, 70, this.otherPlayers[keys[1]].character, 0, this);
        this.otherPlayers[keys[1]].charSprite.setDraggable(false);
        this.otherPlayers[keys[1]].healthText = this.add.text(1110, 15, String(this.otherPlayers[keys[1]].health) + "/100", textStyle);
        this.otherPlayers[keys[1]].cardCountIcons = this.add.sprite(1160, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers[keys[1]].cardCountText = this.add.text(1120, 60, String(this.otherPlayers[keys[1]].hand), textStyle);
        //Third Other Player if there is one
        if (keys.length >= 3){
            this.otherPlayers[keys[2]].charSprite = new CardSprite(50, 250, this.otherPlayers[keys[2]].character, 0, this);
            this.otherPlayers[keys[2]].charSprite.setDraggable(false);
            this.otherPlayers[keys[2]].healthText = this.add.text(100, 195, String(this.otherPlayers[keys[2]].health) + "/100", textStyle);
            this.otherPlayers[keys[2]].cardCountIcons = this.add.sprite(120, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers[keys[2]].cardCountText = this.add.text(150, 240, String(this.otherPlayers[keys[2]].hand), textStyle);
        }
        //Fourth Other Player if there is one
        if (keys.length == 4){
            this.otherPlayers[keys[3]].charSprite = new CardSprite(1230, 250, this.otherPlayers[keys[3]].character, 0, this);
            this.otherPlayers[keys[3]].charSprite.setDraggable(false);
            this.otherPlayers[keys[3]].healthText = this.add.text(1110, 195, String(this.otherPlayers[keys[3]].health) + "/100", textStyle);
            this.otherPlayers[keys[3]].cardCountIcons = this.add.sprite(1160, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers[keys[3]].cardCountText = this.add.text(1120, 240, String(this.otherPlayers[keys[3]].hand), textStyle);
        }
    }

    placeHand() {
        let increment = 880 / this.mainPlayer.hand.length;
        let pos = 200;
        for (let i = 0; i < this.mainPlayer.hand.length; i++) {
            this.hand[i].move(pos, 650);
            this.hand[i].setDepth(this.mainPlayer.hand.length - i);
            pos += increment;
        }
    }

    setOtherPlayersCardCount(username, newCount){
        this.otherPlayers[username].hand = newCount;
        this.otherPlayers[username].cardCountText.setText(String(newCount));
    }

    setOtherPlayersHealth(username, health){
        this.otherPlayers[username].health = health;
        this.otherPlayers[username].healthText.setText(String(health) + "/100");
    }

    setMainPlayersHealth(health){
        this.mainPlayer.health = health;
        this.mainPlayer.healthText.setText(String(health) + "/100");
    }

    removeCard(index = 0){
        //remove the card object
        this.mainPlayer.hand.splice(index,1);
        //remove the cards graphical representation
        let destroyArray = this.hand.splice(index,1);
        destroyArray[0].destroy();
        //replace cards as needed
        this.placeHand();
    }

    addCard(card){
        this.mainPlayer.hand.push(card);
        let tempCard = new CardSprite(200,650,card,0,this);
        tempCard.specEmitter.on("cardDragEnd", this.checkOverlap, this);
        this.hand.push(tempCard);
        this.placeHand();
    }

    checkOverlap(cardBounds, that){
        let overlapped = false;
        //grab the keys of our players to check
        let keys = Object.keys(this.otherPlayers);
        //check if the card overlapped with any of the players cards
        for (let key of keys){
            if (Phaser.Geom.Rectangle.Overlaps(cardBounds, this.otherPlayers[key].charSprite.graphic.getBounds())){
                console.log("You put a card on " +  key);
                overlapped = true;
            }
        }
        if(!overlapped){
            that.restorePos();
        }

    }

}

// exports the class so it may be imported/required elsewhere
module.exports = MainGame;