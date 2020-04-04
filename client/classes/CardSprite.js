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
    graghic;
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

    /** used to create an instance of the card */
    constructor(card, scene){
        this.card = card;
        this.scene = scene;
        this.constructGraghic();
    }

    /** used to link the stored Phaser elements to the current scene */
    link(scene){
        this.scene.add.existing(this.graghic);
        this.scene.add.existing(this.nameText);
        this.scene.add.existing(this.descripText);
    }

    /** Used to construct the graghic object or phaser group object upon getting the internal this.card */
    constructGraghic(){
        //create the main graghic
        this.graghic = this.scene.add.sprite(200,200,"fireball");
        this.graghic.setOrigin(.5,.5)
        this.graghic.setScale(1.5)
        this.graghic.setInteractive();
        this.scene.input.setDraggable(this.graghic);
        //let listerners for certain emitted events
        this.scene.input.on('pointerdown', this.rightClick, this)
        this.scene.input.on("dragstart", this.storePos, this)
        this.scene.input.on('drag', this.whenDragged, this);
        this.scene.input.on("dragend", this.stoppedDragging, this)

        //create the name text graghic
        this.nameText = this.scene.add.text(this.graghic.x - 28, this.graghic.y - 59, 'Fire Ball',{
            font: "12px consolas",
            color: "dark black"
        });
        this.nameText.setOrigin(0,0);

        //create the name text graghic
        this.descripText = this.scene.add.text(this.graghic.x - 27, this.graghic.y + 28, "1 damage!",{
            font: "5px consolas",
            color: "dark black"
        });
        this.descripText.setOrigin(0,0);
    }

    /** Used to Store the current coordinates of the card graghic */
    storePos(){
        this.coords.x = this.graghic.x;
        this.coords.y = this.graghic.y;
    }

    /** Used to restore the graghic to the location last stored in coords */
    restorePos(){
        this.graghic.setX(this.coords.x);
        this.graghic.setY(this.coords.y);
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
        this.nameText.setX(this.graghic.x - 28);
        this.nameText.setY(this.graghic.y - 59);
        this.descripText.setX(this.graghic.x - 27);
        this.descripText.setY(this.graghic.y + 28);
    }

    /** Used to decide weather to shrink or enlarge based on the bool large, when the card is right clicked. Must Be Used With Event That Passes pointer */
    rightClick(pointer){
        if (pointer.rightButtonDown()){
            if(this.large == false){
                this.large = true;
                this.enlarge();
            } else {
                this.large = false;
                this.shrink();
            }
        }
    }

    /** used to center and enlarge the card so effects may be read */
    enlarge(){
        //store the current x and y
        this.storePos();

        // move everything to the center
        this.graghic.setX(640);
        this.graghic.setY(360);
        this.nameText.setX(480);
        this.nameText.setY(50);
        this.descripText.setX(480);
        this.descripText.setY(500);

        //enlarge everything
        this.graghic.setScale(8);
        this.nameText.setFontSize(60);
        this.descripText.setFontSize(30);
    }

    /** Used to return the card back to normal after enlarge has been used */
    shrink(){
        //move everything back
        this.restorePos();
        this.moveText();

        //shrink everything down
        this.graghic.setScale(1.5);
        this.nameText.setFontSize(12);
        this.descripText.setFontSize(5);
    }

    /** calls to the global socket to emit to the server to active this card */
    activate(){
        socket.emit("activate","Target")
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = CardSprite;