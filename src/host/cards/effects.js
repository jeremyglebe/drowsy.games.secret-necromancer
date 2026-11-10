/**
 * The building blocks cards are made of. A card's effects run in order, each
 * one picking who it hits (a selector) and doing something to them.
 *
 * Every effect gets a context:
 *   { field, caster, target, card, result }
 * caster is null when nobody in particular cast it (an encounter acting).
 * result collects what happened, and gets sent to everyone so the table can
 * animate it: { rolls, dodged, slain, chosen, ... }
 */

import { roll, d6 } from './dice.js';

/** Target name used for "the thing in the middle of the table" */
export const ENCOUNTER = '##ENCOUNTER##';

/* -------------------------------------------------------------------- */
/* Selectors: who an effect hits                                         */
/* -------------------------------------------------------------------- */

const living = (field) => Object.keys(field.players).filter((n) => field.players[n].health > 0);

/** Whoever the card was played on */
export const Target = (ctx) => (ctx.target ? [ctx.target] : []);
/** Whoever cast it */
export const Self = (ctx) => (ctx.caster ? [ctx.caster] : []);
/** Every living player except the caster */
export const Others = (ctx) => living(ctx.field).filter((n) => n != ctx.caster);
/** Every living player */
export const Everyone = (ctx) => living(ctx.field);
/** The encounter in the middle of the table, if there is one */
export const Encounter = (ctx) => (ctx.field.encounter ? [ENCOUNTER] : []);
/** One living player at random (the same one for the rest of the card) */
export const RandomPlayer = (ctx) => {
    if (!ctx.result.chosen) {
        const options = living(ctx.field);
        ctx.result.chosen = options[Math.floor(Math.random() * options.length)];
    }
    return ctx.result.chosen ? [ctx.result.chosen] : [];
};

/** Runs one selector or a list of them, without repeats */
function select(selector, ctx) {
    const list = Array.isArray(selector) ? selector : [selector];
    return [...new Set(list.flatMap((s) => s(ctx)))];
}

/** Rolls dice and remembers the roll so the table can show it */
function rollFor(ctx, spec, label) {
    const r = roll(spec);
    ctx.result.rolls.push({ ...r, label });
    return r;
}

/* -------------------------------------------------------------------- */
/* Effects                                                               */
/* -------------------------------------------------------------------- */

/**
 * Deals damage. One roll is shared by everyone it hits.
 * tags:
 *   dodgeable  Robes can dodge it
 *   fire       Ember doesn't care
 * The caster's Wands add to it.
 */
export const Damage = (selector, dice, tags = {}) => (ctx) => {
    const { field, caster } = ctx;
    const victims = select(selector, ctx);
    if (!victims.length) return;
    const source = caster && field.players[caster];
    const rolled = rollFor(ctx, dice, 'damage');
    const amount = rolled.total + (source ? source.power : 0);
    for (const name of victims) {
        if (name == ENCOUNTER) {
            if (field.damageEncounter(amount, caster)) ctx.result.slain = true;
            continue;
        }
        const victim = field.players[name];
        // Evasion 1 dodges on a 6, 2 on a 5+, 3 on a 4+
        if (tags.dodgeable && victim.evasion > 0) {
            const dodge = d6();
            const need = 7 - victim.evasion;
            ctx.result.rolls.push({ spec: 'd6', dice: [dodge], bonus: 0, total: dodge, label: 'dodge', need });
            if (dodge >= need) {
                ctx.result.dodged = true;
                continue;
            }
        }
        victim.takeDamage(amount, tags);
    }
};

/** Heals, up to max health */
export const Heal = (selector, dice) => (ctx) => {
    const rolled = rollFor(ctx, dice, 'heal');
    for (const name of select(selector, ctx)) {
        const p = ctx.field.players[name];
        if (p && p.health > 0) p.health = Math.min(p.maxHealth, p.health + rolled.total);
    }
};

/** Draws cards from the main deck */
export const Draw = (selector, count = 1) => (ctx) => {
    for (const name of select(selector, ctx)) {
        for (let i = 0; i < count; i++) ctx.field.sendCard(name);
    }
};

/** Throws away cards at random */
export const Discard = (selector, count = 1) => (ctx) => {
    for (const name of select(selector, ctx)) {
        const hand = ctx.field.players[name]?.hand;
        for (let i = 0; i < count && hand?.length; i++) {
            const [card] = hand.splice(Math.floor(Math.random() * hand.length), 1);
            ctx.field.discardCard(card);
        }
    }
};

/** Takes a random card from them and gives it to the caster */
export const Steal = (selector) => (ctx) => {
    for (const name of select(selector, ctx)) {
        const hand = ctx.field.players[name]?.hand ?? [];
        // Secret dark arts stay secret: those can't be stolen
        const stealable = hand.map((c, i) => i).filter((i) => hand[i].type != 'necromancy');
        if (!stealable.length) {
            ctx.result.empty = true;
            continue;
        }
        const [card] = hand.splice(stealable[Math.floor(Math.random() * stealable.length)], 1);
        ctx.field.giveCard(ctx.caster, card);
        ctx.result.looted = true;
    }
};

/** They skip their next turn */
export const SkipTurn = (selector) => (ctx) => {
    for (const name of select(selector, ctx)) ctx.field.players[name].frozen = true;
};

/** More mana every turn from now on */
export const AddIncome = (selector, amount = 1) => (ctx) => {
    for (const name of select(selector, ctx)) ctx.field.players[name].crystals += amount;
};

/** Empties their mana bank */
export const DrainMana = (selector) => (ctx) => {
    for (const name of select(selector, ctx)) {
        ctx.field.players[name].mana = 0;
        ctx.field.sendMana(name);
    }
};

/**
 * Puts the card in front of the caster, where its passives apply for as
 * long as it stays there: Equip(Evasion(1))
 */
export const Equip = (...passives) => {
    const effect = (ctx) => {
        const player = ctx.field.players[ctx.caster];
        player.items.push(ctx.card);
        player.calcStats();
    };
    effect.passives = passives;
    return effect;
};

/** Brings a dead player back as a Thrall */
export const Raise = (selector) => (ctx) => {
    for (const name of select(selector, ctx)) ctx.field.raise(name);
};

/**
 * Puts an encounter in the middle of the table. It has its own health, and
 * every Necromancy phase it plays `card` (a card name) with nobody as the
 * caster. Only one encounter at a time.
 */
export const Summon = ({ name, image, health, card }) => (ctx) => {
    ctx.field.summon({ name, image, health, card });
};
