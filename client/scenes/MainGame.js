const client = require('../SocketClient');
const Phaser = require("phaser");
const CardSprite = require("../classes/CardSprite");

class MainGame extends Phaser.Scene {

    constructor() {
        super("MainGame");
    }

    /** stores an array of the card sprites */
    hand = [];

    init(field) {

        /**
         * Map of usernames to Player instances. Duplicate of the players
         * object on field, except we'll remove the client's personal Player.
         * Since we don't know who that is yet, we'll wait for the event.
         */
        this.otherPlayers = field.players;
        /** Tells if a necromancy card ha been played this turn, only matters if this client is a necromancer, default is false */
        this.necroCardPlayed = false;
        /** Used to keep track of weather it is the players turn */
        this.isYourTurn = false;
        /** Used to store the string displayed by quickTextDisplayTween, scale is managed by tween */
        this.quickText = this.add.text(640, 200, "QuickText", { color: "white", bold: true }).setOrigin(.5, .5);
        this.quickText.setFontSize(50);
        this.quickText.setScale(0);
        this.quickText.depth = 50;

        /** A tween for quickly displaying text on screen */
        this.quickTextDisplayTween = this.tweens.add({
            targets: this.quickText,
            y: 150,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            paused: true,
            yoyo: true,
            hold: 1000,
            repeat: false,
        });

    }

    create() {
        //create the background
        let bg = this.add.sprite(0, 0, "gamebackground_graphic").setOrigin(0, 0);
        // When the client receives their player info, start building the screen
        client.on('your player', (player) => {
            // Store the player
            this.mainPlayer = player;
            this.mainPlayer.handSprites = [];
            // Remove this client's player from the other players list
            delete this.otherPlayers[this.mainPlayer.username];
            this.placePlayerSprites();
            this.initalSetPlayersSprites();
            this.createTurnEndButton();
        });

        // When the server gives you a new card, add it to the local hand
        client.on('your new card', (card) => {
            this.addCard(card);
        });

        // Listener for the end of the turn
        client.on('turn start', (username) => {
            this.turnChange(username);
        });

        client.on('spell played', this.onSpellPlayed.bind(this));
        client.on('sync', this.checkSync.bind(this));

    }

    displayGrandmaster(username){
        this.quickTextDisplay("The Grandmaster is " + username + "!");
    }

    onSpellPlayed(obj) {
        this.checkSync({
            player: this.mainPlayer,
            field: obj.field
        });
    }

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
        this.mainPlayer.healthText = this.add.text(1140, 620, String(this.mainPlayer.health) + "/100", { color: "white" });
        this.mainPlayer.healthText.setOrigin(.5, .5);
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
        this.otherPlayers[keys[0]].charSprite.setDraggable(false, true);
        this.otherPlayers[keys[0]].charSprite.setDefaultPos();
        this.otherPlayers[keys[0]].healthText = this.add.text(100, 15, String(this.otherPlayers[keys[0]].health) + "/100", textStyle);
        this.otherPlayers[keys[0]].cardCountIcons = this.add.sprite(120, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers[keys[0]].cardCountText = this.add.text(150, 60, String(this.otherPlayers[keys[0]].hand), textStyle);
        this.otherPlayers[keys[0]].usernameText = this.add.text(100, 0, this.otherPlayers[keys[0]].username, textStyle);
        //Second Other Player
        this.otherPlayers[keys[1]].charSprite = new CardSprite(1230, 70, this.otherPlayers[keys[1]].character, 0, this);
        this.otherPlayers[keys[1]].charSprite.setDraggable(false, true);
        this.otherPlayers[keys[1]].charSprite.setDefaultPos();
        this.otherPlayers[keys[1]].healthText = this.add.text(1110, 15, String(this.otherPlayers[keys[1]].health) + "/100", textStyle);
        this.otherPlayers[keys[1]].cardCountIcons = this.add.sprite(1160, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers[keys[1]].cardCountText = this.add.text(1120, 60, String(this.otherPlayers[keys[1]].hand), textStyle);
        this.otherPlayers[keys[1]].usernameText = this.add.text(1110, 0, this.otherPlayers[keys[1]].username, textStyle);
        //Third Other Player if there is one
        if (keys.length >= 3) {
            this.otherPlayers[keys[2]].charSprite = new CardSprite(50, 250, this.otherPlayers[keys[2]].character, 0, this);
            this.otherPlayers[keys[2]].charSprite.setDraggable(false, true);
            this.otherPlayers[keys[2]].charSprite.setDefaultPos();
            this.otherPlayers[keys[2]].healthText = this.add.text(100, 195, String(this.otherPlayers[keys[2]].health) + "/100", textStyle);
            this.otherPlayers[keys[2]].cardCountIcons = this.add.sprite(120, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers[keys[2]].cardCountText = this.add.text(150, 240, String(this.otherPlayers[keys[2]].hand), textStyle);
            this.otherPlayers[keys[2]].usernameText = this.add.text(100, 180, this.otherPlayers[keys[2]].username, textStyle);
        }
        //Fourth Other Player if there is one
        if (keys.length == 4) {
            this.otherPlayers[keys[3]].charSprite = new CardSprite(1230, 250, this.otherPlayers[keys[3]].character, 0, this);
            this.otherPlayers[keys[3]].charSprite.setDraggable(false, true);
            this.otherPlayers[keys[3]].charSprite.setDefaultPos();
            this.otherPlayers[keys[3]].healthText = this.add.text(1110, 195, String(this.otherPlayers[keys[3]].health) + "/100", textStyle);
            this.otherPlayers[keys[3]].cardCountIcons = this.add.sprite(1160, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers[keys[3]].cardCountText = this.add.text(1120, 240, String(this.otherPlayers[keys[3]].hand), textStyle);
            this.otherPlayers[keys[3]].usernameText = this.add.text(1110, 180, this.otherPlayers[keys[3]].username, textStyle);
        }
    }

    placeHand() {
        let increment = 880 / this.mainPlayer.hand.length;
        let pos = 200;
        for (let i = 0; i < this.mainPlayer.hand.length; i++) {
            this.hand[i].move(pos, 650);
            this.hand[i].setDepth(this.mainPlayer.hand.length - i);
            this.hand[i].index = i;
            this.hand[i].setDefaultPos();
            pos += increment;
        }
    }

    setOtherPlayersCardCount(username, newCount) {
        this.otherPlayers[username].hand = newCount;
        this.otherPlayers[username].cardCountText.setText(String(newCount));
    }

    setOtherPlayersHealth(username, health) {
        this.otherPlayers[username].health = health;
        this.otherPlayers[username].healthText.setText(String(health) + "/100");
    }

    setMainPlayersHealth(health) {
        this.mainPlayer.health = health;
        this.mainPlayer.healthText.setText(String(health) + "/100");
    }

    removeCard(index = 0) {
        //remove the card object
        this.mainPlayer.hand.splice(index, 1);
        //remove the cards graphical representation
        let destroyArray = this.hand.splice(index, 1);
        destroyArray[0].destroy();
        //replace cards as needed
        this.placeHand();
    }

    addCard(card) {
        this.mainPlayer.hand.push(card);
        let tempCard = new CardSprite(200, 650, card, 0, this);
        tempCard.specEmitter.on("cardDragEnd", this.checkOverlapTarget, this);
        this.hand.push(tempCard);
        this.placeHand();
    }

    checkOverlapTarget(cardBounds, that) {
        let target = that.card.targetType;
        console.log(that);
        console.log(target);
        if (target == "player") {
            this.checkOtherPlayersOverlap(cardBounds, that);
        } else if (target == "self") {
            this.checkMainplayerOverlap(cardBounds, that);
        } else if (target == "others" || target == "all") {
            this.checkUpperBoundsOverlap(that);
        } else {
            that.restoreDefaultPos();
        }
    }

    checkOtherPlayersOverlap(cardBounds, that) {
        let overlapped = false;
        //grab the keys of our players to check
        let keys = Object.keys(this.otherPlayers);
        //check if the card overlapped with any of the players cards
        for (let key of keys) {
            if (Phaser.Geom.Rectangle.Overlaps(cardBounds, this.otherPlayers[key].charSprite.graphic.getBounds()) && this.isYourTurn) {
                overlapped = true;
                //determine if it is a spell or an item
                if (that.card.type == "spell") {
                    client.emit('play spell', {
                        index: that.index,
                        name: that.card.name,
                        targets: key
                    });
                } else if (that.card.type == "item") {
                    client.emit('play spell', {
                        index: that.index,
                        name: that.card.name,
                        targets: key
                    });
                } else if (that.card.type == "necromancy") {
                    if (this.necroCardPlayed == false) {
                        this.necroCardPlayed = true;
                        client.emit('play spell', {
                            index: that.index,
                            name: that.card.name,
                            targets: key
                        });
                    } else {
                        overlapped = false;
                    }
                }
                if (overlapped) {
                    this.removeCard(that.index);
                }
            }
        }
        if (!overlapped) {
            that.restoreDefaultPos();
        }
    }

    checkMainplayerOverlap(cardBounds, that) {
        let overlapped = false;
        //check if the card overlapped with any of the players cards
        if (Phaser.Geom.Rectangle.Overlaps(cardBounds, this.mainPlayer.characterSprite.getBounds()) && this.isYourTurn) {
            overlapped = true;
            client.emit('play spell', {
                index: that.index,
                name: that.card.name,
                targets: this.mainPlayer.username
            });
            this.removeCard(that.index);
        }
        if (!overlapped) {
            that.restoreDefaultPos();
        }
    }

    checkUpperBoundsOverlap(that) {
        let overlapped = false;
        //check if the card overlapped with any of the players cards
        console.log(that);
        if (that.graphic.y > 250) {
            overlapped = true;
            client.emit('play spell', {
                index: that.index,
                name: that.card.name,
                targets: "ignore me"
            });
            this.removeCard(that.index);
        }
        if (!overlapped) {
            that.restoreDefaultPos();
        }
    }

    createTurnEndButton() {
        //add end turn button
        this.turnEndButtonText = this.add.text(1140, 670, "End Turn!");
        this.turnEndButtonText.setOrigin(0.5)
        this.turnEndButtonText.setFontSize(30);
        this.turnEndButtonText.setScale(0);
        this.turnEndButton = this.add.rectangle(1140, 670, 240, 50, 0x88FF88, 0.5);
        this.turnEndButton.setOrigin(0.5);
        this.turnEndButton.setInteractive();
        this.turnEndButton.setScale(0);
        // When the box is clicked, open the editor
        this.turnEndButton.on('pointerdown', this.turnEnd, this);
    }

    turnChange(username) {
        //reset ability to play necromancer cards, only matter if this client is the necromancer
        this.necroCardPlayed = false;
        //check if it is this client's turn
        if (username == this.mainPlayer.username) {
            this.isYourTurn = true;
            this.quickTextDisplay("It's your turn!");
            //make the button appear
            this.turnEndButton.setScale(1);
            this.turnEndButtonText.setScale(1);
        } else {
            this.quickTextDisplay("It's " + username + "'s turn!");
        }
    }

    turnEnd() {
        //Change it to not be your turn
        this.isYourTurn = false;
        //make the turnEndButton disappear
        this.turnEndButton.setScale(0);
        this.turnEndButtonText.setScale(0);
        //send to the server that you've ended your turn
        client.emit("turn end");
    }

    quickTextDisplay(string) {
        this.quickText.setText(string);
        this.quickTextDisplayTween.play();
    }

    gameOver(username){
        if (this.mainPlayer.username == username){
            this.scene.start("Endingscreen",{status: "won", username: username});
        } else {
            this.scene.start("Endingscreen",{status: "lost", username: username});
        }
    }

    userDie(username){
        if (this.mainPlayer.username == username){
            this.mainPlayer.healthText.setText("You Died");
        } else {
            this.quickTextDisplay("Player " + username + " Died!");
            this.otherPlayers[username].healthText.setText("dead");
            //make sure cards cannot be played on this player's card
            delete this.otherPlayers[username];
        }
    }

    checkSync(data) {
        //data to check against
        let checkMainPlayer = data.player;
        let checkOtherPlayers = data.field.players;
        //flags
        let mainPlayerHandBad = false;

        //check sync on client's main player
        //check health
        if (checkMainPlayer.health != this.mainPlayer.health) { this.setMainPlayersHealth(checkMainPlayer.health); }
        //check hand size
        if (checkMainPlayer.hand.length != this.mainPlayer.hand.length) { mainPlayerHandBad = true; }
        //if hand size is good, check individual cards
        if (!mainPlayerHandBad) {
            for (let i = 0; i < checkMainPlayer.hand.length; i++) {
                if (checkMainPlayer.hand[i].name != this.mainPlayer.hand[i].name) {
                    mainPlayerHandBad = true;
                }
            }
        }
        //if it's not synced, remove the hand and manually resync it
        if (mainPlayerHandBad) {
            console.log("hands not synced!", this.mainPlayer.hand.length, checkMainPlayer.hand.length);
            for (let obj of this.hand) {
                obj.destroy();
            }
            this.mainPlayer.hand = [];
            this.hand = [];
            for (let i = 0; i < checkMainPlayer.hand.length; i++) {
                this.addCard(checkMainPlayer.hand[i]);
            }
        }

        //check the other players data
        let keys = Object.keys(this.otherPlayers);
        for (let i = 0; i < keys.length; i++) {
            //check other players health
            if (checkOtherPlayers[keys[i]].health != this.otherPlayers[keys[i]].health) {
                this.setOtherPlayersHealth(keys[i], checkOtherPlayers[keys[i]].health);
            }
            //check card count
            if (checkOtherPlayers[keys[i]].hand != this.otherPlayers[keys[i]].hand) {
                this.setOtherPlayersCardCount(keys[i], checkOtherPlayers[keys[i]].hand);
            }
        }
    }

}

// exports the class so it may be imported/required elsewhere
module.exports = MainGame;