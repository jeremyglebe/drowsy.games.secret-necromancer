//imports
const Phaser = require("phaser");
const cardtest = require("./scenes/cardtest");
const boot = require("./scenes/boot");
const Connect = require('./scenes/Connect');


/** Start of the Phaser game object*/

/** configuartion object for the main Phaser game object */
const gameConfig = {
    title: 'Circle of Fate - Client',

    type: Phaser.AUTO,

    scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        width: 1280,
        height: 720
    },

    pixelArt: true,

    dom: {
        createContainer: true
    },

    backgroundColor: '#000000',

    scene: [
        //cardtest,
        boot,
        Connect
    ]
};

//create the primary game object
const game = new Phaser.Game(gameConfig);

// Starts the first scene, for now is a test
game.scene.start("boot");