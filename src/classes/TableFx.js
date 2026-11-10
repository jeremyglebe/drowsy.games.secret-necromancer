import Phaser from 'phaser';
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
        if (name == '##ENCOUNTER##') return { x: 640, y: 150 };
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

    /**
     * The little stat line under a player's health: shield icon with how
     * much damage they block, sword icon with their bonus damage, and how
     * often they dodge. align is 'left', 'right' or 'center'.
     */
    renderStats(holder, items = [], x, y, align, crystals = 0) {
        const count = (name) => items.filter((i) => i.name == name).length;
        const key = [count('Shield'), count('Robe'), count('Wand'), crystals].join();
        if (holder.statKey == key) return;
        holder.statKey = key;
        holder.statLine?.destroy();
        if (holder.defenseText) holder.defenseText.setText('');
        const parts = [];
        if (count('Shield')) parts.push(['icon_shield', `-${Math.min(3, count('Shield'))}`]);
        if (count('Wand')) parts.push(['icon_sword', `+${count('Wand') * 2}`]);
        if (count('Robe')) parts.push([null, `dodge ${7 - Math.min(3, count('Robe'))}+`]);
        // Mana Crystals are public: everyone can see your income
        if (crystals) parts.push(['icon_crystal', `+${crystals}`]);
        if (!parts.length) return;
        const line = this.scene.add.container(x, y);
        let cx = 0;
        for (const [icon, text] of parts) {
            if (icon) {
                line.add(this.scene.add.sprite(cx, 0, icon).setOrigin(0, 0.5).setScale(icon == 'icon_crystal' ? 0.55 : 1.2));
                cx += 18;
            }
            const label = this.scene.add.text(cx, 0, text, textStyle(16, '#a8d8ff')).setOrigin(0, 0.5);
            line.add(label);
            cx += label.width + 10;
        }
        const width = cx - 10;
        line.x = align == 'right' ? x - width : align == 'center' ? x - width / 2 : x;
        holder.statLine = line;
    }

    /** Shows the ice shards next to a frozen player */
    renderFrozen(name, holder, frozen) {
        if (!!frozen == !!holder.frozenIcon) return;
        if (!frozen) {
            holder.frozenIcon.destroy();
            holder.frozenIcon = null;
            return;
        }
        const { x, y } = this.playerPos(name);
        holder.frozenIcon = this.scene.add.sprite(x + 30, y - 45, "icon_ice").setScale(0.9).setDepth(6);
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
                {
                    x: STAGE_X, y: STAGE_Y, scale: STAGE_SCALE, alpha: 1, duration: 380, ease: 'Back.easeOut', onUpdate: apply,
                    onComplete: () => this.showDice(play.rolls, STAGE_X + 130, STAGE_Y),
                },
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
        if (play.cardname == 'Fireball' || play.cardname == 'Eldritch Horror') {
            // Bursts in place
            return { x: STAGE_X, y: STAGE_Y, scale: STAGE_SCALE * 1.6, alpha: 0 };
        }
        if (play.target) {
            return { ...this.playerPos(play.target), scale: 0.5, alpha: 0.2 };
        }
        return { x: STAGE_X, y: STAGE_Y, scale: 0.5, alpha: 0 };
    }

    /* ---------------------------------------------------------------- */
    /* Dice                                                              */
    /* ---------------------------------------------------------------- */

    /**
     * Tumbles the dice from a play and then shows what came up.
     * @param {object[]} rolls the rolls from a 'spell played' message
     */
    showDice(rolls = [], x, y) {
        const s = this.scene;
        const shown = rolls.filter((r) => r.dice.length);
        if (!shown.length) return;
        const SIZE = 34, GAP = 8, ROW = 56;
        const top = y - ((shown.length - 1) * ROW) / 2;
        const all = [];
        shown.forEach((r, row) => {
            const ry = top + row * ROW;
            const faces = r.dice.map((value, i) => {
                const die = this.drawDie(x + i * (SIZE + GAP), ry, SIZE, 1 + Math.floor(Math.random() * 6));
                die.setDepth(67).setAngle(Phaser.Math.Between(-40, 40));
                all.push(die);
                return { die, value };
            });
            const bonus = r.bonus ? (r.bonus > 0 ? ` +${r.bonus}` : ` ${r.bonus}`) : '';
            let text = r.label == 'dodge'
                ? `dodge on ${r.need}+`
                : `${bonus} = ${r.total}`;
            const label = s.add.text(x + r.dice.length * (SIZE + GAP) - GAP / 2 + 6, ry, '', textStyle(22, r.label == 'heal' ? '#55ff77' : '#ffe680'))
                .setOrigin(0, 0.5).setDepth(67);
            all.push(label);
            // Tumble for a bit, then land on the real numbers
            let ticks = 0;
            s.time.addEvent({
                delay: 70,
                repeat: 6,
                callback: () => {
                    ticks++;
                    const last = ticks > 6;
                    for (const f of faces) {
                        this.setDieFace(f.die, last ? f.value : 1 + Math.floor(Math.random() * 6), SIZE);
                        f.die.setAngle(last ? 0 : Phaser.Math.Between(-40, 40));
                    }
                    if (last) {
                        if (r.label == 'dodge') text = `${r.total >= r.need ? 'dodged!' : 'no dodge'} (${r.need}+)`;
                        label.setText(text);
                    }
                },
            });
        });
        s.time.delayedCall(this.hold + 900, () => {
            s.tweens.add({ targets: all, alpha: 0, duration: 250, onComplete: () => all.forEach((o) => o.destroy()) });
        });
    }

    /** A white die with pips, drawn in code (we never drew dice) */
    drawDie(x, y, size, value) {
        const g = this.scene.add.graphics({ x, y });
        this.setDieFace(g, value, size);
        return g;
    }

    setDieFace(g, value, size) {
        const h = size / 2, r = size * 0.09, o = size * 0.27;
        g.clear();
        g.fillStyle(0xfdf6e3, 1).fillRoundedRect(-h, -h, size, size, size * 0.18);
        g.lineStyle(2, 0x1a0026, 1).strokeRoundedRect(-h, -h, size, size, size * 0.18);
        g.fillStyle(0x1a0026, 1);
        const pips = {
            1: [[0, 0]],
            2: [[-o, -o], [o, o]],
            3: [[-o, -o], [0, 0], [o, o]],
            4: [[-o, -o], [o, -o], [-o, o], [o, o]],
            5: [[-o, -o], [o, -o], [0, 0], [-o, o], [o, o]],
            6: [[-o, -o], [o, -o], [-o, 0], [o, 0], [-o, o], [o, o]],
        }[value];
        for (const [px, py] of pips) g.fillCircle(px, py, r);
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
