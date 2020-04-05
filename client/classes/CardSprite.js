//imports
const Phaser = require("phaser");
const socket = require("../SocketClient");

/** 
 * Used to store the client side version of the card, hold all the same
 * data as the server-side version of the card but tacks on the added Phaser
 * objects.
 */
class CardSprite {

    /** Stores the Card passed to it from the server */
    card;
    /** Stores the group of sprites used to visually represent the card class on the client-side */
    graphic;
    /** Stores the text for the name of the card */
    nameText;
    /** Stores the text for the descrition of the card */
    descripText;
    /** Stores the scene the card is being link/created in */
    scene;
    /** Stores if the card is in the enlarged state or not currently, default is false */
    large = false;
    /** Stores the original x and y of the card from when it was changed last */
    coords = {x: 0, y: 0}
    /** 
     * stores the internal depth seperate from the sprite allows for changing of all graphic elements
     * at the same time. This is not used in enlarge. default 0.
     */
    depth = 0;
    /** Keeps track if any card in the game is currently enlarged */
    static anyCardIsEnlarged = false;

    /** used to create an instance of the card */
    constructor(x, y, card, depth, scene){
        this.card = card;
        this.scene = scene;
        this.depth = depth;
        this.constructgraphic(x, y);
    }

    /** used to link the stored Phaser elements to the current scene */
    link(scene){
        this.scene.add.existing(this.graphic);
        this.scene.add.existing(this.nameText);
        this.scene.add.existing(this.descripText);
    }

    /** 
     * Used to construct the graphic object or phaser group object upon getting the internal this.card
     * Should only ever be called once upon the construction of this card 
     */
    constructgraphic(x,y){
        //create the main graphic
        this.graphic = this.scene.add.sprite(x,y,this.card.name + "_graphic");
        this.graphic.setOrigin(.5,.5)
        this.graphic.setScale(1.5)
        this.graphic.setInteractive();
        this.scene.input.setDraggable(this.graphic);
        //let listerners for certain emitted events
        // this.scene.input.on('pointerdown', this.rightClick, this)
        this.graphic.on('pointerdown', this.rightClick, this);
        this.scene.input.on("dragstart", this.storePos, this)
        this.scene.input.on('drag', this.whenDragged, this);
        this.scene.input.on("dragend", this.stoppedDragging, this)

        //create the name text graphic
        this.nameText = this.scene.add.text(this.graphic.x - 28, this.graphic.y - 59, this.card.name,{
            font: "12px consolas",
            color: "dark black"
        });
        this.nameText.setOrigin(0,0);

        //create the name text graphic
        this.descripText = this.scene.add.text(this.graphic.x - 27, this.graphic.y + 28, this.card.description,{
            font: "5px consolas",
            color: "dark black"
        });
        this.descripText.setOrigin(0,0);

        //set everythings depth
        this.graphic.depth = this.depth;
        this.nameText.depth = this.depth;
        this.descripText.depth = this.depth;
    }

    /** Used to Store the current coordinates of the card graphic */
    storePos(){
        this.coords.x = this.graphic.x;
        this.coords.y = this.graphic.y;
    }

    /** Used to restore the graphic to the location last stored in coords */
    restorePos(){
        this.graphic.setX(this.coords.x);
        this.graphic.setY(this.coords.y);
    }

    /** What to do when the object is being dragged */
    whenDragged(pointer, gameObject, dragX, dragY){
        gameObject.x = dragX;
        gameObject.y = dragY;
        this.moveText();
    }

    /** What to do when the object is released from being dragged */
    stoppedDragging(){
        //if it is not on a player, no players so we'll hold to test on that
        if(false){
            //do some targeting stuff here, probably activate and whatnot
        } else {
            this.restorePos();
            this.moveText();
        }
    }

    /** Used to move the text when being dragged */
    moveText = function(){
        this.nameText.setX(this.graphic.x - 28);
        this.nameText.setY(this.graphic.y - 59);
        this.descripText.setX(this.graphic.x - 27);
        this.descripText.setY(this.graphic.y + 28);
    }

    move(x,y){
        this.graphic.setX(x);
        this.graphic.setY(y);
        this.moveText();
    }

    /** Used to decide weather to shrink or enlarge based on the bool large, when the card is right clicked gameobject */
    rightClick(pointer){
        if (pointer.rightButtonDown()){
            if(this.large == false && CardSprite.anyCardIsEnlarged == false){
                this.large = true;
                CardSprite.anyCardIsEnlarged = true;
                this.enlarge();
            } else if (this.large) {
                this.large = false;
                CardSprite.anyCardIsEnlarged = false;
                this.shrink();
            }
        }
    }

    setDepth(depth){
        this.depth = depth;
        this.graphic.depth = this.depth;
        this.nameText.depth = this.depth;
        this.descripText.depth = this.depth;
    }

    /** used to center and enlarge the card so effects may be read */
    enlarge(){
        //store the current x and y
        this.storePos();

        // move everything to the center
        this.graphic.setX(640);
        this.graphic.setY(360);
        this.nameText.setX(480);
        this.nameText.setY(50);
        this.descripText.setX(480);
        this.descripText.setY(500);

        //enlarge everything
        this.graphic.setScale(8);
        this.nameText.setFontSize(60);
        this.descripText.setFontSize(30);

        //make sure the card apears on top of all other game objects
        this.graphic.depth = 99;
        this.nameText.depth = 99;
        this.descripText.depth = 99;
    }

    /** Used to return the card back to normal after enlarge has been used */
    shrink(){
        //move everything back
        this.restorePos();
        this.moveText();

        //shrink everything down
        this.graphic.setScale(1.5);
        this.nameText.setFontSize(12);
        this.descripText.setFontSize(5);

        //make sure to return the depth to it original number
        this.graphic.depth = this.depth;
        this.nameText.depth = this.depth;
        this.descripText.depth = this.depth;
    }

    /** calls to the global socket to emit to the server to active this card */
    activate(){
        socket.emit("activate","Target")
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = CardSprite;