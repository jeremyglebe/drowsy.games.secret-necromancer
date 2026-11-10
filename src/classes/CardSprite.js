import Phaser from 'phaser';

/** Card art is 53x85 pixels; these are positions within that art */
const NAME_Y = -35;        // center of the name banner, relative to card center
const DESC_X = -22;        // left edge of the description box
const DESC_Y = 18;         // top edge of the description box
const ENLARGED_SCALE = 7;

/**
 * The client side version of a card: the card data from the host plus the
 * Phaser objects that draw it. Cards can be dragged (to play them) and
 * right-clicked (to enlarge them).
 */
class CardSprite {

    /** Keeps track of whether any card in the game is currently enlarged */
    static anyCardIsEnlarged = false;
    /** Whether any card is currently being dragged */
    static dragging = false;

    /**
     * @param {number} x
     * @param {number} y
     * @param {object} card card data from the host (name, description, ...)
     * @param {number} depth
     * @param {Phaser.Scene} scene
     * @param {number} scale display scale of the card
     */
    constructor(x, y, card, depth, scene, scale = 2) {
        this.card = card;
        this.scene = scene;
        this.depth = depth;
        this.scale = scale;
        /** Original position to return to after a drag / enlarge */
        this.coords = { x, y };
        /** Index of the card in its hand */
        this.index = 0;
        /** Whether the card is currently enlarged */
        this.large = false;
        /** Whether the card should ever be draggable */
        this.permanentDraggable = true;
        /** Emitter for custom events ('cardDragEnd', 'hover', 'unhover') */
        this.specEmitter = new Phaser.Events.EventEmitter();
        this.constructGraphic(x, y);
    }

    constructGraphic(x, y) {
        this.graphic = this.scene.add.sprite(x, y, this.card.name + "_graphic")
            .setInteractive({ useHandCursor: true });
        this.scene.input.setDraggable(this.graphic);
        this.graphic.on('pointerdown', this.rightClick, this);
        this.graphic.on('dragstart', this.dragStart, this);
        this.graphic.on('drag', this.whenDragged, this);
        this.graphic.on('dragend', this.stoppedDragging, this);
        this.graphic.on('pointerover', () => this.specEmitter.emit('hover', this));
        this.graphic.on('pointerout', () => this.specEmitter.emit('unhover', this));

        this.nameText = this.scene.add.text(0, 0, this.card.name, {
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#000000',
            resolution: 3,
        }).setOrigin(0.5, 0.5);

        this.descripText = this.scene.add.text(0, 0, this.card.description || '', {
            fontFamily: 'monospace',
            color: '#000000',
            resolution: 3,
        }).setOrigin(0, 0);

        this.layout(x, y, this.scale);
        this.setDepth(this.depth);
    }

    /** Positions and sizes the art and text for a given location and scale */
    layout(x, y, scale) {
        this.graphic.setPosition(x, y).setScale(scale);
        this.nameText.setPosition(x, y + NAME_Y * scale).setFontSize(Math.max(1, 6 * scale));
        // Long names (Rise From the Dead) shrink to fit the banner
        const maxWidth = 46 * scale;
        if (this.nameText.width > maxWidth) {
            this.nameText.setFontSize(Math.max(1, 6 * scale * maxWidth / this.nameText.width));
        }
        this.descripText.setPosition(x + DESC_X * scale, y + DESC_Y * scale).setFontSize(Math.max(1, 3.3 * scale));
    }

    get x() { return this.graphic.x; }
    get y() { return this.graphic.y; }

    getBounds() {
        return this.graphic.getBounds();
    }

    /** Sets whether the card is draggable */
    setDraggable(bool, changePermanent = false) {
        if (changePermanent) this.permanentDraggable = bool;
        this.scene.input.setDraggable(this.graphic, bool);
    }

    /** Stores the current coordinates as the card's resting place */
    setDefaultPos(x = this.graphic.x, y = this.graphic.y) {
        this.coords.x = x;
        this.coords.y = y;
    }

    /** Returns the card to its resting place */
    restoreDefaultPos() {
        this.layout(this.coords.x, this.coords.y, this.scale);
        this.setDepth(this.depth);
    }

    move(x, y) {
        this.layout(x, y, this.scale);
    }

    dragStart() {
        CardSprite.dragging = true;
        this.setDepthRaw(80);
    }

    whenDragged(pointer) {
        this.layout(pointer.x, pointer.y, this.scale);
    }

    stoppedDragging() {
        CardSprite.dragging = false;
        this.setDepthRaw(this.depth);
        this.specEmitter.emit('cardDragEnd', this.graphic.getBounds(), this);
    }

    /** Right click toggles the enlarged view */
    rightClick(pointer) {
        if (!pointer.rightButtonDown()) return;
        if (!this.large && !CardSprite.anyCardIsEnlarged) {
            this.enlarge();
        } else if (this.large) {
            this.shrink();
        }
    }

    setAlpha(alpha) {
        this.graphic.setAlpha(alpha);
        this.nameText.setAlpha(alpha);
        this.descripText.setAlpha(alpha);
    }

    setDepth(depth) {
        this.depth = depth;
        this.setDepthRaw(depth);
    }

    setDepthRaw(depth) {
        this.graphic.depth = depth;
        this.nameText.depth = depth + 0.1;
        this.descripText.depth = depth + 0.1;
    }

    /** Centers and enlarges the card so it can be read */
    enlarge() {
        this.large = true;
        CardSprite.anyCardIsEnlarged = true;
        this.scene.input.setDraggable(this.graphic, false);
        this.layout(640, 360, ENLARGED_SCALE);
        this.setDepthRaw(99);
    }

    /** Returns the card to normal after enlarge */
    shrink() {
        this.large = false;
        CardSprite.anyCardIsEnlarged = false;
        this.restoreDefaultPos();
        if (this.permanentDraggable) this.scene.input.setDraggable(this.graphic, true);
    }

    destroy() {
        if (this.large) CardSprite.anyCardIsEnlarged = false;
        this.specEmitter.emit('unhover', this);
        this.graphic.destroy();
        this.nameText.destroy();
        this.descripText.destroy();
    }
}

export default CardSprite;
