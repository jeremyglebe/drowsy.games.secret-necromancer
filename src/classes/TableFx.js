import CardSprite from './CardSprite.js';
import { textStyle } from './UI.js';

/** Where played cards pause so everyone can see them */
const STAGE_X = 640;
const STAGE_Y = 340;
const STAGE_SCALE = 2.6;
const ICON_SCALE = 0.5;
const ICON_STEP = 28;

/**
 * Table animations for MainGame: played cards float up to the middle of the
 * table and then fly to their target, hits flash, damage numbers pop, and
 * equipped items sit next to whoever owns them.
 */
export default class TableFx {

    /** @param {import('../scenes/MainGame.js').default} scene */
    constructor(scene) {
        this.scene = scene;
        /** How long a played card sits in the middle, in ms (set by the host) */
        this.hold = 1300;
        /** How many card animations are still in flight */
        this.active = 0;
        /** Things waiting for the animations to finish (deaths etc.) */
        this.queue = [];
    }

    get busy() {
        return this.active > 0;
    }

    /** Runs fn now, or once the table is quiet */
    whenIdle(fn) {
        if (this.busy) this.queue.push(fn);
        else fn();
    }

    /* ---------------------------------------------------------------- */
    /* Positions                                                         */
    /* ---------------------------------------------------------------- */

    /** Center of a player's character card (or the hand for us) */
    playerPos(name) {
        const s = this.scene;
        if (name == s.mainPlayer?.username) {
            const b = s.mainPlayer.characterSprite.getBounds();
            return { x: b.centerX, y: b.centerY };
        }
        const p = s.otherPlayers[name];
        if (p?.charSprite) return { x: p.charSprite.x, y: p.charSprite.y };
        return { x: STAGE_X, y: STAGE_Y };
    }

    /** Where the i-th equipped item icon of a player goes */
    itemSlot(name, i) {
        const s = this.scene;
        if (name == s.mainPlayer?.username) {
            return { x: 30 + i * ICON_STEP, y: 470 };
        }
        const p = s.otherPlayers[name];
        if (!p) return { x: STAGE_X, y: STAGE_Y };
        const left = p.seat.side == 'left';
        const startX = left ? p.seat.x + 55 : p.seat.x - 55;
        return { x: startX + (left ? 1 : -1) * i * ICON_STEP + (left ? 10 : -10), y: p.seat.y + 88 };
    }

    /* ---------------------------------------------------------------- */
    /* Equipment                                                         */
    /* ---------------------------------------------------------------- */

    /** Shows a little card for each item a player has equipped */
    renderItems(name, holder, items = []) {
        const names = items.map((i) => i.name);
        if (holder.itemNames && holder.itemNames.join() == names.join()) return;
        for (const icon of holder.itemIcons || []) icon.destroy();
        holder.itemNames = names;
        holder.itemIcons = names.map((itemName, i) => {
            const { x, y } = this.itemSlot(name, i);
            return this.scene.add.sprite(x, y, itemName + "_graphic").setScale(ICON_SCALE).setDepth(5);
        });
    }

    /* ---------------------------------------------------------------- */
    /* Played cards                                                      */
    /* ---------------------------------------------------------------- */

    /**
     * Floats a played card to the middle of the table, holds it there for a
     * moment, then sends it on to wherever it's going.
     * @param {object} play the 'spell played' message
     * @param {{x:number,y:number}} from where the card comes from
     * @param {(play) => void} onLand called when the card hits its target
     */
    playCard(play, from, onLand) {
        const s = this.scene;
        this.active++;
        const card = new CardSprite(from.x, from.y, { name: play.cardname, description: play.description || '' }, 65, s, 0.6);
        card.setDraggable(false, true);
        card.graphic.disableInteractive();
        card.setAlpha(0);
        const pos = { x: from.x, y: from.y, scale: 0.6, alpha: 0 };
        const apply = () => {
            card.layout(pos.x, pos.y, pos.scale);
            card.setAlpha(pos.alpha);
        };
        const dest = this.destination(play);

        s.tweens.chain({
            targets: pos,
            tweens: [
                // Up into the middle of the table
                { x: STAGE_X, y: STAGE_Y, scale: STAGE_SCALE, alpha: 1, duration: 380, ease: 'Back.easeOut', onUpdate: apply },
                // Let everyone read it
                { scale: STAGE_SCALE * 1.04, duration: this.hold / 2, yoyo: true, ease: 'Sine.easeInOut', onUpdate: apply },
                // Off to the target
                {
                    x: dest.x, y: dest.y, scale: dest.scale, alpha: dest.alpha, duration: 320, ease: 'Cubic.easeIn', onUpdate: apply,
                    onComplete: () => {
                        card.destroy();
                        try {
                            onLand(play);
                        } finally {
                            this.done();
                        }
                    },
                },
            ],
        });
    }

    /** Where a played card ends up, by what kind of card it is */
    destination(play) {
        const s = this.scene;
        if (['Shield', 'Robe', 'Wand'].includes(play.cardname)) {
            const holder = play.caster == s.mainPlayer.username ? s.mainPlayer : s.otherPlayers[play.caster];
            const slot = this.itemSlot(play.caster, holder?.itemNames?.length ?? 0);
            return { ...slot, scale: ICON_SCALE, alpha: 1 };
        }
        if (play.cardname == 'Fireball') {
            // Bursts in place
            return { x: STAGE_X, y: STAGE_Y, scale: STAGE_SCALE * 1.6, alpha: 0 };
        }
        if (play.target) {
            return { ...this.playerPos(play.target), scale: 0.5, alpha: 0.2 };
        }
        return { x: STAGE_X, y: STAGE_Y, scale: 0.5, alpha: 0 };
    }

    done() {
        this.active--;
        if (this.active <= 0) {
            this.active = 0;
            const queued = this.queue;
            this.queue = [];
            for (const fn of queued) fn();
        }
    }

    /* ---------------------------------------------------------------- */
    /* Impacts                                                           */
    /* ---------------------------------------------------------------- */

    /** Briefly flashes a player's card */
    flash(name, color = 0xff3333) {
        const s = this.scene;
        const graphic = name == s.mainPlayer.username
            ? s.mainPlayer.characterSprite.graphic
            : s.otherPlayers[name]?.charSprite?.graphic;
        if (!graphic) return;
        const holder = name == s.mainPlayer.username ? s.mainPlayer : s.otherPlayers[name];
        graphic.setTintFill(color);
        s.time.delayedCall(140, () => {
            if (holder.tint) graphic.setTint(holder.tint);
            else graphic.clearTint();
        });
    }

    shake() {
        this.scene.cameras.main.shake(260, 0.008);
    }

    /** A number (or word) that pops off a player's card and fades upward */
    popText(name, text, color = '#ff5555') {
        const { x, y } = this.playerPos(name);
        const label = this.scene.add.text(x, y - 20, text, textStyle(30, color)).setOrigin(0.5).setDepth(66);
        this.scene.tweens.add({
            targets: label,
            y: y - 80,
            alpha: 0,
            duration: 1100,
            ease: 'Cubic.easeOut',
            onComplete: () => label.destroy(),
        });
    }
}
