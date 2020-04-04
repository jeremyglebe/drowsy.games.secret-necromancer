console.log("Made it here.");

//imports
const Phaser = require("phaser");


/** Start of the Phaser game object*/

/** configuartion object for the main Phaser game object */
const gameConfig = {
    title: 'Circle of Fate - Client',

    type: Phaser.AUTO,

    scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        width: 800,
        height: 600
    },

    dom: {
        createContainer: true
    },

    backgroundColor: '#000000',

    scene: []
};

//create the primary game object
const game = new Phaser.Game(gameConfig);

// Starts the first scene, for now is a test
game.scene.start("cardtest");