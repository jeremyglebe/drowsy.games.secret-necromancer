import Phaser from 'phaser';
import { makeButton, textStyle } from './UI.js';

const NECRO_PHASE = '##NECRO##';

/**
 * Interactive tutorial overlay for MainGame. Walks the player through their
 * first turn against bots; some steps wait for the player to actually do the
 * thing (play a Bolt, end their turn) before moving on.
 */
export default class Tutorial {

    /** @param {import('../scenes/MainGame.js').default} scene */
    constructor(scene) {
        this.scene = scene;
        this.index = -1;

        const gm = () => scene.grandmaster || 'the Grandmaster';
        const seatBounds = () => {
            const sprites = Object.values(scene.otherPlayers).map((p) => p.charSprite.getBounds());
            return sprites.length ? sprites : null;
        };

        this.steps = [
            {
                text: "Welcome to Secret Necromancer!\n\nOne player is secretly the Necromancer. Everyone else serves the light... or so they claim.",
            },
            {
                text: () => `This is your secret role. You're a Sorcerer: protect the Grandmaster and destroy the Necromancer.\n\nNext to it is your character, ${scene.mainPlayer.character.name}, who has a special ability. Hover any card to read it.`,
                highlight: () => [scene.mainPlayer.roleSprite.getBounds(), scene.mainPlayer.characterSprite.getBounds()],
            },
            {
                text: () => `The Grandmaster is public: ${gm()}.\n\nIf the Grandmaster dies, the Necromancer wins. If the Necromancer dies, everyone else wins.`,
                highlight: () => [new Phaser.Geom.Rectangle(370, 2, 540, 42)],
            },
            {
                text: "These are the other players: their name, health, and how many cards they hold.\n\nOne of them (not the Grandmaster) is the Necromancer.",
                highlight: seatBounds,
            },
            {
                text: "This is your mana. You make 1 every turn, and whatever you don't spend carries over. The crystal in each card's corner is its cost.\n\nOnly you can see your bank. Saving up looks the same as secretly paying for dark rituals...",
                highlight: () => [scene.manaText.getBounds(), scene.manaIcon.getBounds()],
            },
            {
                text: "It's your turn! Drag a Bolt from your hand and drop it on a player you suspect. It costs 1 mana and rolls 2d6 damage.\n\n(Not the Grandmaster!)",
                highlight: () => [new Phaser.Geom.Rectangle(270, 525, 840, 190)],
                waitFor: (event, payload) => event == 'card played' && payload.card.name == 'Bolt',
            },
            {
                text: "Zap! Most characters only get one Bolt per turn. Other cards are only limited by your mana.\n\nFireball (2 mana) rolls 1d6 damage against EVERY other player, the Grandmaster too. To cast it, drag it into the middle of the table.",
                highlight: () => [scene.playZone.getBounds()],
            },
            {
                text: "Shields, Robes and Wands are equipment (1 mana each). Drag them onto your character card. Shields block 1 damage per hit, Robes let you dodge Bolts on a 6, Wands add +2 to your damage rolls.\n\nTry the Shield, or click Next.",
                highlight: () => [scene.mainPlayer.characterSprite.getBounds()],
                waitFor: (event, payload) => event == 'card played' && payload.card.name == 'Shield',
                allowNext: true,
            },
            {
                text: "When you're done, click End Turn. You draw a new card at the start of each turn.\n\nMana Crystals are free to play and make you 1 more mana every turn. Everyone can see how many you have.",
                highlight: () => [scene.turnEndButton.rect.getBounds()],
                waitFor: (event) => event == 'turn end',
            },
            {
                text: () => `Now the others take their turns.\n\nWatch who attacks whom. The Necromancer wants ${gm()} dead!`,
                waitFor: (event, payload) => event == 'turn start' && payload == NECRO_PHASE,
                panelY: 370,
            },
            {
                text: "Necromancy phase! Once per round, the Necromancer's secret ritual takes effect.\n\nWitch Brew hits its victim for 2d6 and drains their mana. Eldritch Horror summons a monster that mauls someone every round until it's destroyed. Raise Dead brings back a dead player as a Thrall.\n\nOh, and the Necromancer's Bolts are free. Nobody can tell.",
                panelY: 370,
            },
            {
                text: () => `That's everything! Find the Necromancer and destroy them before they get ${gm()}.\n\nGood luck!`,
                nextLabel: "Let's go!",
                panelY: 370,
            },
        ];

        // Panel
        this.panel = scene.add.rectangle(640, 330, 660, 180, 0x1a0026, 0.92)
            .setStrokeStyle(3, 0xb36bff).setDepth(70);
        this.text = scene.add.text(640, 310, "", {
            ...textStyle(21),
            wordWrap: { width: 620 },
        }).setOrigin(0.5).setDepth(71);
        this.nextButton = makeButton(scene, 870, 395, 150, 40, "Next", () => this.next());
        this.nextButton.setDepth(72);
        this.skipButton = makeButton(scene, 410, 395, 150, 40, "Skip tutorial", () => this.finish(), 0x888888);
        this.skipButton.setDepth(72);
        this.skipButton.text.setFontSize(18);

        // Highlight boxes
        this.highlights = [];

        // Hover tooltips should show over the tutorial panel
        scene.tooltipBg.setDepth(80);
        scene.tooltipText.setDepth(81);

        scene.events.on('tut', this.onEvent, this);
        this.next();
    }

    get step() {
        return this.steps[this.index];
    }

    onEvent(event, payload) {
        const step = this.step;
        if (step && step.waitFor && step.waitFor(event, payload)) {
            // Small pause so the result of the action is visible first
            this.scene.time.delayedCall(700, () => {
                if (this.step === step) this.next();
            });
        }
    }

    next() {
        this.index++;
        if (this.index >= this.steps.length) return this.finish();
        const step = this.step;

        const y = step.panelY ?? 330;
        const text = typeof step.text == 'function' ? step.text() : step.text;
        this.text.setText(text);
        const h = Math.max(150, this.text.height + 90);
        this.panel.setPosition(640, y).setSize(660, h);
        this.panel.setOrigin(0.5);
        this.text.setPosition(640, y - 18);

        const showNext = !step.waitFor || step.allowNext;
        const buttonY = y + h / 2 - 28;
        this.nextButton.setVisible(showNext);
        this.nextButton.text.setText(step.nextLabel || "Next");
        this.nextButton.rect.setPosition(870, buttonY);
        this.nextButton.text.setPosition(870, buttonY);
        this.skipButton.rect.setPosition(410, buttonY);
        this.skipButton.text.setPosition(410, buttonY);

        this.setHighlights(step.highlight ? step.highlight() : null);
    }

    setHighlights(rects) {
        for (const h of this.highlights) h.destroy();
        this.highlights = [];
        if (!rects) return;
        for (const r of rects) {
            const box = this.scene.add.rectangle(r.centerX, r.centerY, r.width + 16, r.height + 16)
                .setStrokeStyle(4, 0xffe680).setDepth(69);
            this.scene.tweens.add({
                targets: box,
                alpha: 0.25,
                duration: 600,
                yoyo: true,
                repeat: -1,
            });
            this.highlights.push(box);
        }
    }

    finish() {
        this.scene.events.off('tut', this.onEvent, this);
        this.setHighlights(null);
        this.panel.destroy();
        this.text.destroy();
        for (const b of [this.nextButton, this.skipButton]) {
            b.rect.destroy();
            b.text.destroy();
        }
        this.index = this.steps.length;
    }
}
